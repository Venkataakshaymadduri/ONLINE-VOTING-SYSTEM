import PageLink from '../components/PageLink.jsx';

export default function DeniedPage({ navigate }) {
  return (
    <section className="card">
      <p className="eyebrow">Access denied</p>
      <h1>Vote already recorded</h1>
      <p className="intro">Our records show that this voter has already submitted a ballot. A second vote cannot be accepted.</p>
      <PageLink href="/" navigate={navigate}>Return to login</PageLink>
    </section>
  );
}
