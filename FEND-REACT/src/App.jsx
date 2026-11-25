import { useCallback, useEffect, useState } from 'react';
import BallotPage from './pages/BallotPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import DeniedPage from './pages/DeniedPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OtpPage from './pages/OtpPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((nextPath) => {
    window.history.pushState(null, '', nextPath);
    setPath(nextPath);
  }, []);

  const pages = {
    '/': <LoginPage navigate={navigate} />,
    '/register': <RegisterPage navigate={navigate} />,
    '/otp': <OtpPage navigate={navigate} />,
    '/ballot': <BallotPage navigate={navigate} />,
    '/confirmation': <ConfirmationPage navigate={navigate} />,
    '/denied': <DeniedPage navigate={navigate} />,
  };

  return (
    <main className="page-shell narrow-shell">
      <p className="demo-notice">Prototype only: this demo uses browser storage and is not suitable for real elections.</p>
      {pages[path] || pages['/']}
    </main>
  );
}
