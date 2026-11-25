# SecureVote admin console

React version of the election officer registration, OTP login, dashboard, candidate and constituency management, schedule, and results pages.

Each screen is a separate component under `src/pages/`: `AdminLoginPage`, `AdminRegisterPage`, `AdminOtpPage`, `DashboardPage`, `CandidatesPage`, `ConstituenciesPage`, `SchedulePage`, and `ResultsPage`. Shared navigation and UI components are in `src/components/`.

```sh
npm install
npm run api
```

In a second terminal, start the admin app with `npm run dev`. In a third terminal, start the voter portal from `../FEND-REACT` with `npm run dev`. The admin app runs at `http://localhost:5174`, the voter portal at `http://localhost:5173`, and both use the shared API at `http://127.0.0.1:3001`.

The shared API stores the election schedule, candidates, ballots, and published results in `data/election.json` under this project. The voter portal refreshes election status and published results while the login page is open. This is a local demonstration only: storage, credentials, demo OTPs, the browser CAPTCHA, and API have no production security and are not suitable for real elections.
