export default function AuthShell({ children }) {
  return (
    <main className="page-shell narrow-shell">
      <p className="demo-notice">Prototype only: browser storage and demo OTPs are not secure and are not suitable for real elections.</p>
      <section className="card">{children}</section>
    </main>
  );
}
