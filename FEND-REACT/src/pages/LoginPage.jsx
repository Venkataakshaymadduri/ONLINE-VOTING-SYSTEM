import { useEffect, useState } from 'react';
import Message from '../components/Message.jsx';
import PageLink from '../components/PageLink.jsx';
import Captcha from '../components/Captcha.jsx';
import { getElection } from '../utils/api.js';

const makeCaptcha = () => {
  const first = Math.floor(Math.random() * 9) + 1;
  const second = Math.floor(Math.random() * 9) + 1;
  return { first, second, answer: first + second };
};
const getVoters = () => {
  try { return JSON.parse(localStorage.getItem('registeredVoters') || '{}'); }
  catch { return {}; }
};

export default function LoginPage({ navigate }) {
  const [message, setMessage] = useState('');
  const [captcha, setCaptcha] = useState(makeCaptcha);
  const [election, setElection] = useState(null);
  const [electionError, setElectionError] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let active = true;
    const loadElection = () => getElection()
      .then((data) => {
        if (active) { setElection(data); setElectionError(''); }
      })
      .catch((error) => {
        if (active) setElectionError(error.message);
      });
    loadElection();
    const interval = window.setInterval(loadElection, 15000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const voterId = String(form.get('voterId')).trim().toUpperCase();
    const password = String(form.get('password'));
    const answer = String(form.get('captcha')).trim();
    const voter = getVoters()[voterId];

    if (Number(answer) !== captcha.answer) {
      setMessage('CAPTCHA answer is incorrect. Please try again.');
      setCaptcha(makeCaptcha());
      event.currentTarget.elements.captcha.value = '';
      return;
    }
    if (!voter || voter.password !== password) {
      const next = attempts + 1;
      setAttempts(next);
      setMessage(next >= 5 ? 'Too many failed attempts in this session. Refresh the page before trying again.' :
        `Invalid voter ID or password. ${5 - next} attempts remaining.`);
      setCaptcha(makeCaptcha());
      return;
    }
    if (voter.hasVoted || localStorage.getItem(`voted_${voterId}`) === 'true') {
      navigate('/denied');
      return;
    }
    setAttempts(0);
    sessionStorage.setItem('voterId', voterId);
    sessionStorage.setItem('otp', String(Math.floor(100000 + Math.random() * 900000)));
    sessionStorage.setItem('otpCreated', String(Date.now()));
    sessionStorage.setItem('contact', voter.contact || 'your registered contact');
    sessionStorage.removeItem('otpVerified');
    navigate('/otp');
  }

  return (
    <section className="card">
      <p className="eyebrow">SecureVote</p>
      <h1>Voter login</h1>
      <p className="intro">Enter your voter ID and password, then complete the CAPTCHA security check.</p>
      {electionError && <p className="message error" role="alert">{electionError}</p>}
      {election && (
        <div className="info-box" aria-live="polite">
          <strong>Election: {election.status === 'open' ? 'Voting is open' : election.status === 'upcoming' ? 'Voting has not opened yet' : election.status === 'unscheduled' ? 'Not scheduled' : 'Voting is closed'}</strong>
          {election.schedule && <><br /><span>{election.schedule.date} | {election.schedule.start} to {election.schedule.end}</span></>}
          {election.publishedResults && (
            <div className="published-results">
              <strong>Published results</strong>
              {election.publishedResults.results.map((result) => (
                <p key={result.name}>{result.name} ({result.party}): {result.votes} votes, {result.share}%</p>
              ))}
            </div>
          )}
        </div>
      )}
      <form className="form-grid" onSubmit={submit}>
        <label htmlFor="voterId">Voter ID</label>
        <input id="voterId" name="voterId" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" autoComplete="username" placeholder="Example: 887777" required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter password" required />
        <Captcha first={captcha.first} second={captcha.second} onRefresh={() => setCaptcha(makeCaptcha())} />
        <button type="submit" disabled={!election || Boolean(electionError)}>Continue</button>
        <Message text={message} />
      </form>
      <PageLink href="/register" navigate={navigate}>New voter? Register here</PageLink>
    </section>
  );
}
