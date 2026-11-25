import { useEffect, useState } from 'react';
import Message from '../components/Message.jsx';
import { getElection, getVotes, publishResults } from '../utils/api.js';

function tallyVotes(candidates, votes) {
  const counts = new Map(candidates.map((candidate) => [candidate.name, 0]));
  for (const vote of votes) {
    if (counts.has(vote.candidate)) counts.set(vote.candidate, counts.get(vote.candidate) + 1);
  }
  const total = votes.length;
  return candidates.map((candidate) => ({
    ...candidate,
    votes: counts.get(candidate.name) || 0,
    share: total ? Math.round(((counts.get(candidate.name) || 0) / total) * 100) : 0,
  }));
}

export default function ResultsPage() {
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [published, setPublished] = useState(null);
  const [closed, setClosed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getElection()
      .then((election) => {
        setCandidates(election.candidates);
        setPublished(election.publishedResults);
        setClosed(election.status === 'closed');
        if (election.publishedResults) setResults(election.publishedResults.results);
      })
      .catch((error) => setMessage(`${error.message} Start the shared API with npm run api.`))
      .finally(() => setLoading(false));
  }, []);

  async function runTally() {
    try {
      const { votes } = await getVotes();
      setResults(tallyVotes(candidates, votes));
      setMessage('Shared voter ballots tallied. Verify the figures before publishing.');
    } catch (error) {
      setMessage(`${error.message} Start the shared API with npm run api.`);
    }
  }

  async function publish() {
    try {
      const { publishedResults } = await publishResults();
      setPublished(publishedResults);
      setResults(publishedResults.results);
      setMessage('Results published to the voter portal.');
    } catch (error) {
      setMessage(`${error.message} Start the shared API with npm run api.`);
    }
  }

  return (
    <>
      <header className="topline">
        <div><p className="eyebrow">Election closeout</p><h1>Results</h1><p>Tally stored demo ballots after the election closes.</p></div>
        <span className={`tag ${published ? '' : 'closed'}`}>{published ? 'Published' : 'Unpublished'}</span>
      </header>
      <section className="workspace">
        <div className="info-box">
          <strong>{published ? 'Results have been published.' : results ? 'Tally complete.' : 'Results are ready to be tallied.'}</strong><br />
          <span>{loading ? 'Loading shared election data…' : closed ? 'The election is closed. You can run the final tally.' : 'Configure a closed election schedule before tallying.'}</span>
        </div>
        <div className="actions">
          <button type="button" disabled={!closed || loading} onClick={runTally}>Run result tally</button>
          <button className="secondary" type="button" disabled={!results || published || loading} onClick={publish}>Publish results</button>
        </div>
        <Message text={message} type={message.startsWith('Shared voter') || message.startsWith('Results published') ? 'success' : 'error'} />
        {results && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Candidate</th><th>Party or group</th><th>Votes</th><th>Vote share</th></tr></thead>
              <tbody>
                {results.length ? results.map((result, index) => (
                  <tr key={`${result.name}-${index}`}><td>{result.name}</td><td>{result.party}</td><td>{result.votes}</td><td>{result.share}%</td></tr>
                )) : <tr><td className="empty" colSpan="4">No candidates are available for tallying.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
