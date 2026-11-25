import { useState } from 'react';
import Message from '../components/Message.jsx';
import PageLink from '../components/PageLink.jsx';
import Captcha from '../components/Captcha.jsx';

export default function RegisterPage({ navigate }) {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [captcha, setCaptcha] = useState(() => { const first = Math.floor(Math.random() * 9) + 1; const second = Math.floor(Math.random() * 9) + 1; return { first, second, answer: first + second }; });

  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const aadhaar = String(form.get('aadhaar')).trim();
    const dob = String(form.get('dob'));
    if (Number(form.get('captcha')) !== captcha.answer) { setMessage('CAPTCHA answer is incorrect.'); setMessageType('error'); setCaptcha(() => { const first = Math.floor(Math.random() * 9) + 1; const second = Math.floor(Math.random() * 9) + 1; return { first, second, answer: first + second }; }); return; }

    if (!/^\d{12}$/.test(aadhaar)) {
      setMessage('Aadhaar number must contain exactly 12 digits.');
      setMessageType('error');
      return;
    }

    const voterId = aadhaar.slice(-6);
    const voters = JSON.parse(localStorage.getItem('registeredVoters') || '{}');
    if (voters[voterId]) {
      setMessage('This Aadhaar number is already registered.');
      setMessageType('error');
      return;
    }

    voters[voterId] = { password: dob, contact: 'your registered contact', hasVoted: false };
    localStorage.setItem('registeredVoters', JSON.stringify(voters));
    setMessage(`Registration successful. Your Voter ID is ${voterId}.`);
    setMessageType('success');
    window.setTimeout(() => navigate('/'), 900);
  }

  return (
    <section className="card">
      <p className="eyebrow">SecureVote</p>
      <h1>Voter registration</h1>
      <p className="intro">Register with your Aadhaar number. The last six digits become your Voter ID and your date of birth is your password.</p>
      <form className="form-grid" onSubmit={submit}>
        <label htmlFor="aadhaar">Aadhaar card number</label>
        <input id="aadhaar" name="aadhaar" inputMode="numeric" pattern="[0-9]{12}" maxLength="12" placeholder="Enter 12-digit Aadhaar number" required />
        <label htmlFor="dob">Date of birth</label>
        <input id="dob" name="dob" type="date" required />
        <Captcha first={captcha.first} second={captcha.second} onRefresh={() => { const first = Math.floor(Math.random() * 9) + 1; const second = Math.floor(Math.random() * 9) + 1; setCaptcha({ first, second, answer: first + second }); }} />
        <button type="submit">Complete registration</button>
        <Message text={message} type={messageType} />
      </form>
      <PageLink href="/" navigate={navigate}>Already registered? Go to login</PageLink>
    </section>
  );
}
