import { useEffect, useState } from 'react';
import Message from '../components/Message.jsx';
import { getElection, saveSchedule } from '../utils/api.js';

export default function SchedulePage() {
  const [saved, setSaved] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getElection()
      .then(({ schedule }) => setSaved(schedule))
      .catch((error) => {
        setMessage(`${error.message} Start the shared API with npm run api.`);
        setMessageType('error');
      })
      .finally(() => setLoading(false));
  }, []);

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = String(form.get('date'));
    const start = String(form.get('start'));
    const end = String(form.get('end'));
    if (end <= start) {
      setMessage('Closing time must be after opening time.');
      setMessageType('error');
      return;
    }

    const schedule = { date, start, end };
    try {
      await saveSchedule(schedule);
      setSaved(schedule);
      setMessage('Election schedule saved and shared with the voter portal.');
      setMessageType('success');
    } catch (error) {
      setMessage(`${error.message} Start the shared API with npm run api.`);
      setMessageType('error');
    }
  }

  const status = !saved ? null : (() => {
    const now = new Date();
    const opening = new Date(`${saved.date}T${saved.start}`);
    const closing = new Date(`${saved.date}T${saved.end}`);
    if (now < opening) return 'upcoming';
    return now < closing ? 'open' : 'closed';
  })();

  return (
    <>
      <header className="topline"><div><p className="eyebrow">Election operations</p><h1>Election schedule</h1><p>Voting opens and closes according to this schedule.</p></div></header>
      <section className="workspace">
        <form className="form-grid" key={saved ? `${saved.date}-${saved.start}-${saved.end}` : 'empty'} onSubmit={submit}>
          <label htmlFor="date">Election date</label>
          <input id="date" name="date" type="date" defaultValue={saved?.date || ''} required />
          <div className="grid-two">
            <div><label htmlFor="start">Voting opens</label><input id="start" name="start" type="time" defaultValue={saved?.start || ''} required /></div>
            <div><label htmlFor="end">Voting closes</label><input id="end" name="end" type="time" defaultValue={saved?.end || ''} required /></div>
          </div>
          <button type="submit" disabled={loading}>Save schedule</button>
          <Message text={message || (loading ? 'Loading shared election schedule…' : '')} type={messageType} />
        </form>
        <div className="info-box">
          <strong>{saved ? `Voting is currently ${status}.` : 'No schedule saved.'}</strong><br />
          <span>{saved ? `${saved.date} | ${saved.start} to ${saved.end}` : 'Once saved, the system will determine whether voting is open or closed.'}</span>
        </div>
      </section>
    </>
  );
}
