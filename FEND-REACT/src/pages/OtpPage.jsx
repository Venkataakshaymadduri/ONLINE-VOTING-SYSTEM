import { useEffect, useState } from 'react';
import Message from '../components/Message.jsx';

export default function OtpPage({ navigate }) {
  const [message, setMessage] = useState('');
  const otp = sessionStorage.getItem('otp');
  const created = Number(sessionStorage.getItem('otpCreated'));

  useEffect(() => {
    if (!otp || !created) navigate('/');
  }, [created, navigate, otp]);

  function submit(event) {
    event.preventDefault();
    const enteredOtp = String(new FormData(event.currentTarget).get('otp')).trim();
    if (Date.now() - created > 5 * 60 * 1000) {
      setMessage('This OTP has expired. Please return to login.');
      return;
    }
    const attempts = Number(sessionStorage.getItem('otpAttempts') || '0') + 1;
    sessionStorage.setItem('otpAttempts', String(attempts));
    if (attempts > 5) { setMessage('Too many OTP attempts. Return to login and start again.'); sessionStorage.removeItem('otp'); return; }
    if (enteredOtp !== otp) {
      setMessage('Incorrect OTP. Please try again.');
      return;
    }
    sessionStorage.setItem('otpVerified', 'true');
    sessionStorage.removeItem('otpAttempts');
    navigate('/ballot');
  }

  return (
    <section className="card">
      <p className="eyebrow">Step 2 of 4</p>
      <h1>Verify your OTP</h1>
      <p className="intro">A one-time password was sent to the registered contact <strong>{sessionStorage.getItem('contact') || 'your registered contact'}</strong>.</p>
      <div className="info-box">Demo OTP: <strong>{otp || 'Unavailable'}</strong>. It is valid for 5 minutes. Demo only: no SMS/email is sent.</div>
      <form className="form-grid" onSubmit={submit}>
        <label htmlFor="otp">One-time password</label>
        <input id="otp" name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" placeholder="Enter 6-digit OTP" required />
        <button type="submit">Verify OTP</button>
        <Message text={message} />
      </form>
    </section>
  );
}
