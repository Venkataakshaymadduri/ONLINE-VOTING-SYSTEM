import { useState } from 'react';
import AuthShell from '../components/AuthShell.jsx';
import Link from '../components/Link.jsx';
import Message from '../components/Message.jsx';
import Captcha from '../components/Captcha.jsx';

export default function AdminRegisterPage({ navigate }) {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [captcha, setCaptcha] = useState(() => { const first = Math.floor(Math.random() * 9) + 1; const second = Math.floor(Math.random() * 9) + 1; return { first, second, answer: first + second }; });

  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = String(form.get('phone')).trim();
    const officerId = String(form.get('officerId')).trim();
    const birthDate = String(form.get('dob'));
    const password = String(form.get('password'));
    const confirmation = String(form.get('confirmPassword'));
    if (Number(form.get('captcha')) !== captcha.answer) { setMessage('CAPTCHA answer is incorrect.'); setMessageType('error'); setCaptcha(() => { const first = Math.floor(Math.random() * 9) + 1; const second = Math.floor(Math.random() * 9) + 1; return { first, second, answer: first + second }; }); return; }

    if (!/^[0-9]{10}$/.test(phone)) {
      setMessage('Enter a valid 10-digit phone number.');
      setMessageType('error');
      return;
    }
    if (new Date(birthDate) >= new Date()) {
      setMessage('Date of birth must be in the past.');
      setMessageType('error');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
      setMessage('Password must include uppercase, lowercase, and a number.');
      setMessageType('error');
      return;
    }
    if (password !== confirmation) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return;
    }

    localStorage.setItem('adminRegistration', JSON.stringify({
      phone,
      officerId,
      dateOfBirth: birthDate,
      password,
    }));
    setMessage('Registration complete. You can now sign in with your officer ID.');
    setMessageType('success');
    const formElement = event.currentTarget;
    formElement.reset();
  }

  return (
    <AuthShell>
      <p className="eyebrow">SecureVote administration</p>
      <h1>Register officer</h1>
      <p className="intro">Create an administrator profile using the details issued by the election commission.</p>
      <form className="form-grid" onSubmit={submit}>
        <label htmlFor="phone">Phone number</label>
        <input id="phone" name="phone" type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength="10" placeholder="10-digit phone number" required />
        <label htmlFor="officerId">Election officer ID</label>
        <input id="officerId" name="officerId" required placeholder="Example: EO-2048" />
        <label htmlFor="dob">Date of birth</label>
        <input id="dob" name="dob" type="date" max={new Date().toISOString().slice(0, 10)} required />
        <label htmlFor="password">Create password</label>
        <input id="password" name="password" type="password" minLength="8" required placeholder="At least 8 characters" />
        <label htmlFor="confirmPassword">Confirm password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" minLength="8" required placeholder="Re-enter password" />
        <Captcha first={captcha.first} second={captcha.second} onRefresh={() => { const first = Math.floor(Math.random() * 9) + 1; const second = Math.floor(Math.random() * 9) + 1; setCaptcha({ first, second, answer: first + second }); }} />
        <button type="submit">Create admin profile</button>
        <Message text={message} type={messageType} />
      </form>
      <div className="info-box">Use the election officer ID as your Admin ID when signing in.</div>
      <Link className="secondary-link" href="/" navigate={navigate}>Already registered? Sign in</Link>
    </AuthShell>
  );
}
