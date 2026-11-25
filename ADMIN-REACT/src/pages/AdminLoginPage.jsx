import { useState } from 'react';
import AuthShell from '../components/AuthShell.jsx';
import Link from '../components/Link.jsx';
import Message from '../components/Message.jsx';
import Captcha from '../components/Captcha.jsx';
import { readStorage } from '../utils/storage.js';

const makeCaptcha = () => {
  const first = Math.floor(Math.random() * 9) + 1;
  const second = Math.floor(Math.random() * 9) + 1;
  return { first, second, answer: first + second };
};

export default function AdminLoginPage({ navigate }) {
  const [message, setMessage] = useState('');
  const [captcha, setCaptcha] = useState(makeCaptcha);
  const [attempts, setAttempts] = useState(0);

  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = String(form.get('adminId')).trim().toLowerCase();
    const password = String(form.get('password'));
    const answer = String(form.get('captcha')).trim();
    const registeredAdmin = readStorage('adminRegistration', null);

    if (Number(answer) !== captcha.answer) {
      setMessage('CAPTCHA answer is incorrect. Try again.');
      setCaptcha(makeCaptcha());
      event.currentTarget.elements.captcha.value = '';
      return;
    }
    if (localStorage.getItem('adminLocked') === 'true') {
      setMessage('This administrator account is locked. Contact the election officer.');
      return;
    }
    if (!registeredAdmin || id !== String(registeredAdmin.officerId).toLowerCase() || password !== registeredAdmin.password) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 5) {
        localStorage.setItem('adminLocked', 'true');
        setMessage('Too many failed attempts. This demo account is now locked.');
      } else {
        setMessage(`Invalid Admin ID or password. ${5 - next} attempts remaining.`);
      }
      setCaptcha(makeCaptcha());
      return;
    }

    setAttempts(0);
    sessionStorage.setItem('adminOtp', String(Math.floor(100000 + Math.random() * 900000)));
    sessionStorage.setItem('adminOtpCreated', String(Date.now()));
    sessionStorage.removeItem('adminVerified');
    navigate('/admin-otp');
  }

  return (
    <AuthShell>
      <p className="eyebrow">SecureVote administration</p>
      <h1>Admin login</h1>
      <p className="intro">Sign in to manage the election. Complete the security check before continuing.</p>
      <form className="form-grid" onSubmit={submit}>
        <label htmlFor="adminId">Admin ID</label>
        <input id="adminId" name="adminId" autoComplete="username" required placeholder="Enter admin ID" />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Enter password" />
        <Captcha first={captcha.first} second={captcha.second} onRefresh={() => setCaptcha(makeCaptcha())} />
        <button type="submit">Continue to verification</button>
        <Message text={message} />
      </form>
      <div className="info-box">Use your registered election officer credentials to continue.</div>
      <Link className="secondary-link" href="/admin-register" navigate={navigate}>New election officer? Register here</Link>
    </AuthShell>
  );
}
