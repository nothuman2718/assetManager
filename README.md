# EMS Asset Registry

Industrial Asset Configuration and Device Management Platform for Energy Management Systems.

This repository currently contains the Phase 1 scaffold for a MERN application:

- `frontend/`: React, Vite, and TypeScript app shell.
- `backend/`: Node.js, Express, TypeScript, and MongoDB API scaffold.
- `docs/`: product and technical documentation.
- `plans/`: living task plans and execution checklist.

## Phase 1 Local Setup

Install dependencies after cloning or when starting fresh:

```bash
cd frontend
npm install

cd ../backend
npm install
```

Create environment files from the examples:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Start MongoDB:

```bash
docker compose up -d mongo
```

Run the backend:

```bash
cd backend
npm run dev
```

Run the frontend:

```bash
cd frontend
npm run dev
```

Health check:

```bash
curl http://localhost:4000/api/health
```
