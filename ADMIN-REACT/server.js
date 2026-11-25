import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dataFile = join(dirname(fileURLToPath(import.meta.url)), 'data', 'election.json');
const initialData = { schedule: null, candidates: [], votes: {}, publishedResults: null };

function readData() {
  if (!existsSync(dataFile)) return structuredClone(initialData);
  return JSON.parse(readFileSync(dataFile, 'utf8'));
}

function writeData(data) {
  mkdirSync(dirname(dataFile), { recursive: true });
  writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function send(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

function getElectionStatus(schedule) {
  if (!schedule) return 'unscheduled';
  const now = new Date();
  const opening = new Date(`${schedule.date}T${schedule.start}`);
  const closing = new Date(`${schedule.date}T${schedule.end}`);
  if (now < opening) return 'upcoming';
  return now < closing ? 'open' : 'closed';
}

function isValidSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') return false;
  const startMatch = typeof schedule?.start === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.start);
  const endMatch = typeof schedule?.end === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.end);
  const date = typeof schedule?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(schedule.date)
    ? new Date(`${schedule.date}T00:00:00Z`)
    : null;
  const validDate = date && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === schedule.date;
  return Boolean(validDate && startMatch && endMatch
    && schedule.end > schedule.start);
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) throw new Error('Request body is too large.');
  }
  return JSON.parse(body || '{}');
}

const requestWindows = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 120;

const server = createServer(async (request, response) => {
  const client = request.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const previous = requestWindows.get(client) || { started: now, count: 0 };
  if (now - previous.started > RATE_WINDOW_MS) {
    previous.started = now;
    previous.count = 0;
  }
  previous.count += 1;
  requestWindows.set(client, previous);
  if (previous.count > RATE_LIMIT) {
    send(response, 429, { error: 'Too many requests. Please wait one minute and try again.' });
    return;
  }
  try {
    const url = new URL(request.url, 'http://localhost');
    if (request.method === 'GET' && url.pathname === '/api/election') {
      const data = readData();
      send(response, 200, {
        schedule: data.schedule,
        status: getElectionStatus(data.schedule),
        candidates: data.candidates,
        publishedResults: data.publishedResults,
      });
      return;
    }

    if (request.method === 'PUT' && url.pathname === '/api/schedule') {
      const { schedule } = await readBody(request);
      if (!isValidSchedule(schedule)) {
        send(response, 400, { error: 'Provide a valid date, opening time, and closing time.' });
        return;
      }
      const data = readData();
      data.schedule = schedule;
      data.publishedResults = null;
      writeData(data);
      send(response, 200, { schedule: data.schedule });
      return;
    }

    if (request.method === 'PUT' && url.pathname === '/api/candidates') {
      const { candidates } = await readBody(request);
      if (!Array.isArray(candidates) || candidates.length > 200 || candidates.some((candidate) =>
        !candidate || typeof candidate.name !== 'string' || !candidate.name.trim()
        || candidate.name.length > 100 || typeof candidate.party !== 'string'
        || !candidate.party.trim() || candidate.party.length > 100
      ) || new Set(candidates.map((candidate) => candidate.name.trim().toLowerCase())).size !== candidates.length) {
        send(response, 400, { error: 'Provide a valid candidate list.' });
        return;
      }
      const data = readData();
      data.candidates = candidates;
      writeData(data);
      send(response, 200, { candidates: data.candidates });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/votes') {
      const data = readData();
      send(response, 200, { votes: Object.values(data.votes) });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/votes') {
      const { voterId, candidate } = await readBody(request);
      const data = readData();
      if (typeof voterId !== 'string' || !/^\d{6}$/.test(voterId)
        || typeof candidate !== 'string' || candidate.length > 100
        || !data.candidates.some((entry) => entry.name === candidate)) {
        send(response, 400, { error: 'The voter ID or selected candidate is invalid.' });
        return;
      }
      if (getElectionStatus(data.schedule) !== 'open' || data.publishedResults) {
        send(response, 403, { error: 'Voting is not currently open.' });
        return;
      }
      if (data.votes[voterId]) {
        send(response, 409, { error: 'A vote has already been recorded for this voter.' });
        return;
      }
      data.votes[voterId] = { candidate, recordedAt: new Date().toISOString() };
      writeData(data);
      send(response, 201, { saved: true });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/results/publish') {
      const data = readData();
      if (getElectionStatus(data.schedule) !== 'closed') {
        send(response, 403, { error: 'The election must be closed before publishing results.' });
        return;
      }
      const counts = new Map(data.candidates.map((candidate) => [candidate.name, 0]));
      for (const vote of Object.values(data.votes)) {
        if (counts.has(vote.candidate)) counts.set(vote.candidate, counts.get(vote.candidate) + 1);
      }
      const total = Object.keys(data.votes).length;
      const results = data.candidates.map((candidate) => ({
        ...candidate,
        votes: counts.get(candidate.name) || 0,
        share: total ? Math.round(((counts.get(candidate.name) || 0) / total) * 100) : 0,
      }));
      data.publishedResults = { results, publishedAt: new Date().toISOString() };
      writeData(data);
      send(response, 200, { publishedResults: data.publishedResults });
      return;
    }

    send(response, 404, { error: 'API endpoint not found.' });
  } catch (error) {
    console.error('Election API request failed:', error);
    send(response, 500, { error: 'The election API could not process the request.' });
  }
});

server.listen(3001, '127.0.0.1', () => {
  console.log('Shared election API listening at http://127.0.0.1:3001');
});
