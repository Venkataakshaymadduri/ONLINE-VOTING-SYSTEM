import { useState } from 'react';
import Message from '../components/Message.jsx';
import { readStorage } from '../utils/storage.js';

export default function ConstituenciesPage() {
  const [areas, setAreas] = useState(() => readStorage('constituencies', []));
  const [message, setMessage] = useState('');

  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const updated = [...areas, {
      name: String(form.get('area')).trim(),
      stations: String(form.get('stations')),
    }];
    setAreas(updated);
    localStorage.setItem('constituencies', JSON.stringify(updated));
    event.currentTarget.reset();
    setMessage('Constituency added.');
  }

  function removeArea(index) {
    const updated = areas.filter((_, areaIndex) => areaIndex !== index);
    setAreas(updated);
    localStorage.setItem('constituencies', JSON.stringify(updated));
  }

  return (
    <>
      <header className="topline"><div><p className="eyebrow">Election geography</p><h1>Constituencies</h1><p>Define the areas that will appear on the ballot.</p></div></header>
      <section className="workspace">
        <form className="split-form" onSubmit={submit}>
          <div><label htmlFor="area">Constituency name</label><input id="area" name="area" required placeholder="Example: Central Ward" /></div>
          <div><label htmlFor="stations">Polling stations</label><input id="stations" name="stations" type="number" min="1" required placeholder="Number" /></div>
          <button type="submit">Add constituency</button>
        </form>
        <Message text={message} type="success" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>Constituency</th><th>Polling stations</th><th>Status</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {areas.length ? areas.map((area, index) => (
                <tr key={`${area.name}-${index}`}>
                  <td>{area.name}</td><td>{area.stations}</td><td><span className="tag">Ready</span></td>
                  <td><button className="secondary" type="button" onClick={() => removeArea(index)}>Remove</button></td>
                </tr>
              )) : <tr><td className="empty" colSpan="4">No constituencies added yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
