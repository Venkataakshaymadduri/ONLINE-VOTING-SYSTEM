async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new Error('Cannot connect to the election API. Start it with npm run api.');
  }

  const raw = await response.text();
  let result = {};
  if (raw.trim()) {
    try {
      result = JSON.parse(raw);
    } catch {
      throw new Error(`The API returned invalid data (HTTP ${response.status}). Check the API terminal.`);
    }
  }

  if (!response.ok) {
    throw new Error(result.error || `The election API request failed (HTTP ${response.status}).`);
  }
  if (!raw.trim()) throw new Error('The API returned an empty response. Check server.js.');
  return result;
}

export function getElection() { return request('/api/election'); }
export function saveSchedule(schedule) {
  return request('/api/schedule', { method: 'PUT', body: JSON.stringify({ schedule }) });
}
export function saveCandidates(candidates) {
  return request('/api/candidates', { method: 'PUT', body: JSON.stringify({ candidates }) });
}
export function getVotes() { return request('/api/votes'); }
export function publishResults() {
  return request('/api/results/publish', { method: 'POST' });
}
