# LaunchMitra / Lean MVP — Backend (FastAPI)

API for the Lean MVP (auth, notes, avatar). Deploy to **Render**.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # Edit .env with Supabase (optional for health-only)
```

## Run locally

```bash
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- Health: http://localhost:8000/health
- Docs: http://localhost:8000/docs (when `DEBUG=true`)

## Tests

```bash
pytest tests/ -v
```

## Project layout

- `app/main.py` — FastAPI app, CORS, `/health`, `/api/v1` router
- `app/config.py` — Settings from env
- `app/api/v1/router.py` — Mount notes, users routers here
- `app/core/` — security (JWT), Supabase client
- `tests/` — pytest (e.g. `test_health.py`)

See `docs/lean_mvp/` for feature list and TDD flow.
