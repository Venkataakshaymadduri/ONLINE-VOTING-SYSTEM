import { useEffect, useState } from 'react';
import Link from '../components/Link.jsx';
import { getElection } from '../utils/api.js';
import { getElectionStatus } from '../utils/storage.js';

export default function DashboardPage({ navigate }) {
  const [candidates, setCandidates] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const status = getElectionStatus(schedule);

  useEffect(() => {
    getElection()
      .then((election) => {
        setCandidates(election.candidates);
        setSchedule(election.schedule);
      })
      .catch((requestError) => setError(`${requestError.message} Start the shared API with npm run api.`))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="topline">
        <div>
          <p className="eyebrow">Election control room</p>
          <h1>Good morning, administrator.</h1>
          <p>Monitor the election and keep every stage on schedule.</p>
        </div>
        <span className={`tag ${status === 'closed' ? 'closed' : ''}`}>{status ? `Voting ${status}` : 'No schedule'}</span>
      </header>
      <section className="metrics">
        <article className="metric"><span>Registered voters</span><strong>1,248</strong></article>
        <article className="metric"><span>Polling stations</span><strong>24</strong></article>
        <article className="metric"><span>Candidates</span><strong>{candidates.length}</strong></article>
        <article className="metric"><span>Turnout</span><strong>—</strong></article>
      </section>
      <div className="grid-two">
        <section className="workspace">
          <h2>Election activity</h2>
          <p className="intro">Review the schedule before opening or closing the ballot.</p>
          <div className="info-box">
            <strong>{loading ? 'Loading shared election data…' : status ? `Voting is currently ${status}.` : 'No schedule configured yet.'}</strong><br />
            <span>{error || (schedule ? `${schedule.date} | ${schedule.start} to ${schedule.end}` : 'Set the opening and closing time from Election schedule.')}</span>
          </div>
          <div className="actions">
            <Link className="button-link" href="/schedule" navigate={navigate}>Manage schedule</Link>
            <Link className="button-link" href="/results" navigate={navigate}>Tally results</Link>
          </div>
        </section>
        <section className="workspace">
          <h2>Quick management</h2>
          <p className="intro">Keep the ballot paper and constituencies up to date.</p>
          <div className="actions">
            <Link className="button-link" href="/candidates" navigate={navigate}>Manage candidates</Link>
            <Link className="button-link" href="/constituencies" navigate={navigate}>Manage constituencies</Link>
          </div>
        </section>
      </div>
    </>
  );
}
