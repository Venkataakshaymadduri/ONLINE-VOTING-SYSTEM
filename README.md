# SecureVote – Online Voting System (Academic Demo)

This ZIP contains two separate React/Vite applications and one shared API:

- `ADMIN-REACT` – administrator registration/login, OTP demo, dashboard, candidate management, constituencies, schedule and results.
- `FEND-REACT` – voter registration/login, OTP demo, ballot, confirmation and denied pages.
- `ADMIN-REACT/server.js` – shared API and JSON data file used by both applications.

## Requirements
- Node.js 18 or newer
- npm

## Run the project (three terminals)

### Terminal 1 – Shared API
```bash
cd ADMIN-REACT
npm install
npm run api
```
Keep this terminal running. It listens on `http://127.0.0.1:3001`.

### Terminal 2 – Admin website
```bash
cd ADMIN-REACT
npm run dev
```
Open the URL shown by Vite (normally `http://localhost:5174`).

### Terminal 3 – Voter website
```bash
cd FEND-REACT
npm install
npm run dev
```
Open the URL shown by Vite (normally `http://localhost:5173`).

Both websites proxy `/api` requests to the shared API on port 3001. Do not start a second API process.

## Security features included in this academic prototype
- Arithmetic CAPTCHA on admin and voter registration/login forms.
- Refreshable CAPTCHA challenges.
- Basic failed-login attempt limits in the current browser session.
- OTP expiry after five minutes and a maximum of five OTP attempts.
- API request throttling per client address.
- Server-side validation of candidate and vote request fields.
- Duplicate candidate-name validation.
- Safer API response parsing with readable errors rather than a JSON parse crash.
- Accessible keyboard focus outlines and form labels.

## Important security limitations
This is still a **college demonstration prototype, not a real election system**. CAPTCHA and login attempt limits in browser code can be bypassed by a determined user. Admin/voter accounts and demo OTPs are stored/generated in the browser; OTPs are displayed on screen rather than delivered through a trusted SMS/email provider. The demo server does not implement real identity verification, secure password hashing, server-side authenticated admin sessions, cryptographic ballot secrecy, audit controls, or production-grade database protections. The API's vote endpoint is therefore not suitable for public deployment.

Do not enter real Aadhaar numbers, passwords, voter information, or real election data. Use sample/demo data only.
