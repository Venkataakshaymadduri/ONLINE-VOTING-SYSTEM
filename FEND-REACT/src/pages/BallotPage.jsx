import { useEffect, useState } from 'react';
import Message from '../components/Message.jsx';
import { castVote, getElection } from '../utils/api.js';

export default function BallotPage({ navigate }) {
  const [message, setMessage] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [canVote, setCanVote] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem('otpVerified') !== 'true') {
      navigate('/');
      return;
    }
    getElection()
      .then((election) => {
        setCandidates(election.candidates);
        setCanVote(election.status === 'open' && !election.publishedResults);
        if (election.status !== 'open' || election.publishedResults) setMessage('Voting is not currently open.');
        else if (!election.candidates.length) setMessage('The ballot is not available yet. Contact the election administrator.');
      })
      .catch((error) => setMessage(`${error.message} Start the shared API with npm run api.`))
      .finally(() => setLoading(false));
  }, [navigate]);

  async function submit(event) {
    event.preventDefault();
    const candidate = String(new FormData(event.currentTarget).get('candidate'));
    const voterId = sessionStorage.getItem('voterId');
    if (!voterId || localStorage.getItem(`voted_${voterId}`) === 'true') {
      navigate('/denied');
      return;
    }

    try {
      await castVote(voterId, candidate);
      localStorage.setItem(`voted_${voterId}`, 'true');
      sessionStorage.setItem('receiptCode', `SV-${Math.random().toString(36).slice(2, 10).toUpperCase()}`);
      sessionStorage.setItem('candidate', candidate);
      navigate('/confirmation');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="card">
      <div className="topline"><p className="eyebrow">Step 3 of 4</p><strong>{sessionStorage.getItem('voterId')}</strong></div>
      <h1>Cast your vote</h1>
      <p className="intro">Select one candidate. Your choice cannot be changed after confirmation.</p>
      <form className="form-grid" onSubmit={submit}>
        {candidates.map((candidate, index) => (
          <label className="option" key={candidate.name}>
            <input type="radio" name="candidate" value={candidate.name} required={index === 0} />
            {candidate.name} — {candidate.party}
          </label>
        ))}
        <button type="submit" disabled={loading || !canVote || !candidates.length}>Confirm selection</button>
        <Message text={message} />
      </form>
    </section>
  );
}
