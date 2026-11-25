import { useEffect } from 'react';
import PageLink from '../components/PageLink.jsx';

export default function ConfirmationPage({ navigate }) {
  const candidate = sessionStorage.getItem('candidate') || 'your selected candidate';
  const receipt = sessionStorage.getItem('receiptCode') || 'Unavailable';

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  return (
    <section className="card">
      <p className="eyebrow">Step 4 of 4</p>
      <h1>Vote recorded</h1>
      <p className="intro">Your vote for <strong>{candidate}</strong> has been recorded successfully.</p>
      <div className="receipt"><small>Receipt code</small><br /><strong>{receipt}</strong></div>
      <p className="message success">Your voter status has been updated. Keep this receipt code for your records.</p>
      <PageLink href="/" navigate={navigate}>Return to login</PageLink>
    </section>
  );
}
