# SecureVote voter portal

React version of the voter registration, login, OTP verification, ballot, and confirmation flow.

Each screen is a separate component under `src/pages/`: `LoginPage`, `RegisterPage`, `OtpPage`, `BallotPage`, `ConfirmationPage`, and `DeniedPage`. Shared links and messages are in `src/components/`.

```sh
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default. To share the schedule, candidates, ballots, and published results with the admin console, start `npm run api` in `../ADMIN-REACT`, and run both Vite apps in separate terminals. The API persists shared election data in `ADMIN-REACT/data/election.json`.

This is a local demonstration only: account data, OTPs, the browser CAPTCHA, and API have no production security and are not suitable for real elections.
