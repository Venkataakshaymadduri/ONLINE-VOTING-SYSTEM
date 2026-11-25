import { useCallback, useEffect, useState } from 'react';
import AdminLayout from './components/AdminLayout.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminOtpPage from './pages/AdminOtpPage.jsx';
import AdminRegisterPage from './pages/AdminRegisterPage.jsx';
import CandidatesPage from './pages/CandidatesPage.jsx';
import ConstituenciesPage from './pages/ConstituenciesPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import SchedulePage from './pages/SchedulePage.jsx';

const protectedPaths = ['/dashboard', '/candidates', '/constituencies', '/schedule', '/results'];

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

  const protectedRoute = protectedPaths.includes(path);
  const verified = sessionStorage.getItem('adminVerified') === 'true';

  useEffect(() => {
    if (protectedRoute && !verified) navigate('/');
  }, [navigate, protectedRoute, verified]);

  if (protectedRoute && !verified) return null;

  const pages = {
    '/': <AdminLoginPage navigate={navigate} />,
    '/admin-register': <AdminRegisterPage navigate={navigate} />,
    '/admin-otp': <AdminOtpPage navigate={navigate} />,
    '/dashboard': <DashboardPage navigate={navigate} />,
    '/candidates': <CandidatesPage />,
    '/constituencies': <ConstituenciesPage />,
    '/schedule': <SchedulePage />,
    '/results': <ResultsPage />,
  };

  if (protectedRoute) {
    return (
      <>
        <p className="demo-notice admin-notice">Prototype only: browser storage and demo OTPs are not secure and are not suitable for real elections.</p>
        <AdminLayout path={path} navigate={navigate}>{pages[path]}</AdminLayout>
      </>
    );
  }
  return pages[path] || pages['/'];
}
