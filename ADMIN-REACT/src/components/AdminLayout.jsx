import Link from './Link.jsx';

const navItems = [
  ['/dashboard', 'Overview'],
  ['/candidates', 'Candidates'],
  ['/constituencies', 'Constituencies'],
  ['/schedule', 'Election schedule'],
  ['/results', 'Results'],
];

export default function AdminLayout({ path, navigate, children }) {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <Link className="brand" href="/dashboard" navigate={navigate}>SecureVote<small>Admin console</small></Link>
        <nav className="nav" aria-label="Admin navigation">
          {navItems.map(([href, label]) => (
            <Link key={href} className={path === href ? 'active' : ''} href={href} navigate={navigate}>{label}</Link>
          ))}
          <a href="/" onClick={(event) => {
            event.preventDefault();
            sessionStorage.clear();
            navigate('/');
          }}>Sign out</a>
        </nav>
        <p className="sidebar-note">Demo only — not for real elections.</p>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
