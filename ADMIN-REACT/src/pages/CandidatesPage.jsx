import { useEffect, useState } from 'react';
import Message from '../components/Message.jsx';
import { getElection, saveCandidates } from '../utils/api.js';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getElection()
      .then(({ candidates: savedCandidates }) => setCandidates(savedCandidates))
      .catch((error) => {
        setMessage(`${error.message} Start the shared API with npm run api.`);
        setMessageType('error');
      })
      .finally(() => setLoading(false));
  }, []);

  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const candidate = {
      name: String(form.get('name')).trim(),
      party: String(form.get('party')).trim(),
    };
    const updated = [...candidates, candidate];
    try {
      await saveCandidates(updated);
      setCandidates(updated);
      formElement.reset();
      setMessage('Candidate added to the shared voter ballot.');
      setMessageType('success');
    } catch (error) {
      setMessage(`${error.message} Start the shared API with npm run api.`);
      setMessageType('error');
    }
  }

  async function removeCandidate(index) {
    const updated = candidates.filter((_, candidateIndex) => candidateIndex !== index);
    try {
      await saveCandidates(updated);
      setCandidates(updated);
      setMessage('Candidate removed from the shared voter ballot.');
      setMessageType('success');
    } catch (error) {
      setMessage(`${error.message} Start the shared API with npm run api.`);
      setMessageType('error');
    }
  }

  return (
    <>
      <header className="topline"><div><p className="eyebrow">Ballot management</p><h1>Candidates</h1><p>Add and review candidates before publishing the ballot.</p></div></header>
      <section className="workspace">
        <form className="split-form" onSubmit={submit}>
          <div><label htmlFor="name">Candidate name</label><input id="name" name="name" required placeholder="Full name" /></div>
          <div><label htmlFor="party">Party or group</label><input id="party" name="party" required placeholder="Party name" /></div>
          <button type="submit" disabled={loading}>Add candidate</button>
        </form>
        <Message text={message} type={messageType} />
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Party or group</th><th>Status</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {candidates.length ? candidates.map((candidate, index) => (
                <tr key={`${candidate.name}-${index}`}>
                  <td>{candidate.name}</td><td>{candidate.party}</td><td><span className="tag">Active</span></td>
                  <td><button className="secondary" type="button" onClick={() => removeCandidate(index)}>Remove</button></td>
                </tr>
              )
            ) : <tr><td className="empty" colSpan="4">{loading ? 'Loading shared candidates…' : 'No candidates added yet.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
