# Property Management – Frontend

Vue 3 + TypeScript + Vite SPA for Property Agents. Talks to the backend API via Vite proxy in dev.

## Setup

```bash
npm install
```

## Run (dev)

Start the **backend** first (from `../backend`):

```bash
npm run dev
```

Then start the frontend:

```bash
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api`, `/api-docs`, and `/health` to the backend at `http://localhost:3000`.

## Build

```bash
npm run build
```

Output is in `dist/`. Serve with any static host; point the app at your backend API (e.g. env or build-time base URL) for production.

## Features

- **List** – All property agents with links to view/edit
- **View** – Single agent details and delete (with confirm)
- **Create** – Form at `/agents/new`; redirects to view on success
- **Edit** – Form at `/agents/:id/edit`; uses backend error codes for validation and conflict (e.g. “This email is already in use”)

Errors use the backend [error contract](../backend/docs/api-errors.md): `VALIDATION_ERROR` (field-level), `CONFLICT` (duplicate email), `NOT_FOUND`, `INTERNAL_ERROR`.
