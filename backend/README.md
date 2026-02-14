# LaunchMitra / Lean MVP — Backend (FastAPI)

API for the Lean MVP (auth, notes, avatar). Deploy to **Render**.

## Setup

```bash
cd backend
python3.13 -m venv .venv    # or: python3 -m venv .venv (use 3.13 if available)
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # Edit .env with Supabase (optional for health-only)
```

**Python version:** This project uses 3.13. If your system `python3` is 3.11, use the venv’s interpreter so you get 3.13:

```bash
cd backend
.venv/bin/python3 --version   # should show 3.13.x
.venv/bin/python3 -m uvicorn app.main:app --reload --port 8000
.venv/bin/python3 -m pytest tests/ -v
```

You can still `source .venv/bin/activate` and then use `pip`/`uvicorn`/`pytest` if your activated shell’s `python3` is the venv’s (check with `which python3`).

## Run locally

```bash
uvicorn app.main:app --reload --port 8000
```

Or without relying on activation: `./.venv/bin/python3 -m uvicorn app.main:app --reload --port 8000`

- API: http://localhost:8000
- Health: http://localhost:8000/health
- Swagger UI: http://localhost:8000/docs (restart uvicorn after adding routes to see them)
- Notes: full CRUD at `/api/v1/notes` — POST, GET, GET /{id}, PUT /{id}, DELETE /{id} (JWT required; see `docs/lean_mvp/notes-table.sql`)

## Tests

```bash
pytest tests/ -v
```

Or: `./.venv/bin/python3 -m pytest tests/ -v`

## Project layout

- `app/main.py` — FastAPI app, CORS, `/health`, `/api/v1` router
- `app/config.py` — Settings from env
- `app/api/v1/router.py` — Mount notes, users routers here
- `app/core/` — security (JWT), Supabase client
- `tests/` — pytest (e.g. `test_health.py`)

See `docs/lean_mvp/` for feature list and TDD flow.
