export default function Message({ text, type = 'error' }) {
  return text
    ? <p className={`message ${type}`} role="alert">{text}</p>
    : <p className="message" aria-live="polite" />;
}
