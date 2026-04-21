# WorkOS Frontend Take-Home

## How to Run

**1. Start the API server**
```bash
cd server
npm install
npm run api
```
Runs at `http://localhost:3002`. Use `SERVER_SPEED=slow npm run api` or `SERVER_SPEED=instant npm run api` to adjust latency.

**2. Start the client**
```bash
cd client
npm install
npm run dev
```
Runs at `http://localhost:5173`.

---

## What I'd Improve With More Time

- **Optimistic add/edit** — only deletes are optimistic right now; adds and edits wait for the server. The same `scheduleDelete` pattern could be extended.
- **E2E tests** — Playwright covering the critical paths (add user, assign role, delete with undo). Unit tests cover the non-obvious logic but don't exercise the full flow.
- **Keyboard shortcut to open Add dialog** — a single `useEffect` listening for `n` opens the dialog; small but useful for power users.
- **More microinteractions** — the table rows have a hover transition and Radix handles dialog/toast animations, but there's room for more: a count badge animating when results filter, row entrance animation on add, skeleton-to-content crossfade instead of a hard swap.

---

## Client Documentation

See [`client/README.md`](./client/README.md) for architecture notes, tech stack, and testing details.
