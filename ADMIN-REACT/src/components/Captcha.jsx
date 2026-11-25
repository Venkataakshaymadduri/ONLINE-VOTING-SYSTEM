export default function Captcha({ first, second, onRefresh, inputId = 'captcha' }) {
  return (
    <div className="captcha-block">
      <label htmlFor={inputId}>Security check: what is {first} + {second}?</label>
      <div className="captcha-row">
        <input id={inputId} name="captcha" type="number" inputMode="numeric"
          autoComplete="off" placeholder="Enter answer" required />
        <button className="secondary captcha-refresh" type="button" onClick={onRefresh}
          aria-label="Generate a new CAPTCHA">Refresh</button>
      </div>
    </div>
  );
}
