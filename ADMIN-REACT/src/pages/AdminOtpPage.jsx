import { useEffect, useState } from 'react';
import AuthShell from '../components/AuthShell.jsx';
import Link from '../components/Link.jsx';
import Message from '../components/Message.jsx';

export default function AdminOtpPage({ navigate }) {
  const [message, setMessage] = useState('');
  const otp = sessionStorage.getItem('adminOtp');
  const created = Number(sessionStorage.getItem('adminOtpCreated'));

  useEffect(() => {
    if (!otp) navigate('/');
  }, [navigate, otp]);

  function submit(event) {
    event.preventDefault();
    const enteredOtp = String(new FormData(event.currentTarget).get('otp')).trim();
    if (!otp || !created || Date.now() - created > 5 * 60 * 1000) {
      setMessage('OTP expired. Return to login and request a new OTP.');
      sessionStorage.removeItem('adminOtp');
      return;
    }
    const attempts = Number(sessionStorage.getItem('adminOtpAttempts') || '0') + 1;
    sessionStorage.setItem('adminOtpAttempts', String(attempts));
    if (attempts > 5) { setMessage('Too many OTP attempts. Return to login.'); sessionStorage.removeItem('adminOtp'); return; }
    if (enteredOtp !== otp) {
      setMessage('That OTP is incorrect. Please try again.');
      return;
    }
    sessionStorage.setItem('adminVerified', 'true');
    sessionStorage.removeItem('adminOtpAttempts');
    navigate('/dashboard');
  }

  return (
    <AuthShell>
      <p className="eyebrow">SecureVote administration</p>
      <h1>Verify your device</h1>
      <p className="intro">Enter the six-digit OTP sent to the registered administrator device.</p>
      <div className="info-box">Demo OTP: <strong>{otp || 'Not available'}</strong>. It expires in 5 minutes. Demo only: no SMS/email is sent.</div>
      <form className="form-grid" onSubmit={submit}>
        <label htmlFor="otp">One-time password</label>
        <input id="otp" name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" required placeholder="Enter 6-digit OTP" />
        <button type="submit">Verify and open dashboard</button>
        <Message text={message} />
      </form>
      <Link className="secondary-link" href="/" navigate={navigate}>Back to admin login</Link>
    </AuthShell>
  );
}
