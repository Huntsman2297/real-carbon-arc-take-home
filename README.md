# Carbon Arc — Task Manager

Lightweight task app: Flask API + Vite/React UI, runnable with Docker Compose.

## Quick start

```bash
docker-compose up --build
```
#macOS: if port 5000 is already in use, turn off AirPlay Receiver (System Settings → General → AirDrop & Handoff)

Then open **http://localhost:3000**.

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:5000 |

API calls from the browser go to the frontend (`:3000`); Vite proxies `/tasks` to the `backend` service on port 5000.

### Local development (without Docker)

**Backend**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

**Frontend** (proxy to a local backend)

```bash
cd frontend
npm install
VITE_API_PROXY_TARGET=http://127.0.0.1:5000 npm run dev
```

**Tests**

```bash
cd backend
pip install -r requirements.txt
pytest
```

## Assumptions

- Tasks live in memory only; restarting the backend clears them.
- Task IDs are integers that auto-increment from 1.
- Empty / whitespace-only titles are rejected.
- Completing an already-completed task is a no-op success (still returns the task).
- Docker Compose service name `backend` is the proxy target inside the compose network.

## Design answers

### How did you handle API errors?

The API returns JSON `{"error": "..."}` with appropriate status codes (400 for validation, 404 for missing IDs). The React client parses that body, surfaces `error` in the UI, and treats non-OK responses as failures so list/stats stay consistent after a failed action.

### What tests would you write if given more time?

- Edge cases: complete/delete already-missing IDs, double-complete, concurrent creates.
- Contract tests for every status code and response shape.
- Frontend tests for add/complete/delete flows and error banner rendering (React Testing Library).
- A thin compose smoke check that hits `/tasks` through the Vite proxy.

### What would you improve with 1 extra hour?

- Persist tasks (SQLite) so restarts don’t wipe data.
- Basic loading / empty / optimistic UI polish and keyboard-friendly focus management.
- A health endpoint and slightly tighter Docker images (multi-stage frontend build + static serve) if we outgrow the Vite dev server.
