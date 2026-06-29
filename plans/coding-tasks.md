# Coding Tasks

## Status Legend

- `[ ]` Not started
- `[x]` Completed

## Confirmed Defaults

- Frontend: React with Vite and TypeScript.
- Backend: Node.js, Express, and TypeScript.
- Database: MongoDB with Mongoose.
- Export format for v1: CSV only.
- Hierarchy UI for v1: tree view.
- Project approach: complete and test one task group before moving to the next.

## Phase 1: Project Setup

### 1.1 Repository Structure

- [x] Create `frontend/` for the React application.
- [x] Create `backend/` for the Express API.
- [x] Create root-level development files after app scaffolding, including `.gitignore`, `README.md`, and `.env.example` references.
- [x] Keep all generated source code separate from `docs/` and `plans/`.

Test after completion:

- [x] Confirm `frontend/` and `backend/` exist.
- [x] Confirm docs and plans remain unchanged except intentional updates.

### 1.2 Frontend Scaffold

- [x] Initialize a Vite React TypeScript app in `frontend/`.
- [x] Install routing, server-state, forms, validation, charts, Tailwind CSS, and UI dependencies.
- [x] Add base folders: `app`, `components`, `features`, `hooks`, `services`, `types`, and `utils`.
- [x] Add initial app shell placeholder with route support.

Test after completion:

- [x] Run frontend typecheck.
- [x] Run frontend dev server.
- [x] Confirm the app responds from the dev server.

### 1.3 Backend Scaffold

- [x] Initialize a Node.js Express TypeScript app in `backend/`.
- [x] Add scripts for dev, build, start, lint, typecheck, and test.
- [x] Add base folders: `modules`, `shared/config`, `shared/database`, `shared/middleware`, `shared/utils`, and `shared/logger`.
- [x] Add Express app startup with health route.

Test after completion:

- [x] Run backend typecheck.
- [x] Run backend dev server.
- [x] Call the health route and confirm a successful response.

### 1.4 MongoDB and Environment Setup

- [x] Add backend environment loading.
- [x] Add MongoDB connection utility.
- [x] Add `.env.example` files for backend and frontend.
- [x] Add Docker Compose for MongoDB.

Test after completion:

- [x] Start MongoDB using Docker for verification.
- [x] Start backend and confirm MongoDB connection logs.
- [x] Stop services cleanly.
- [ ] Verify `docker compose up -d mongo` after Docker Compose is fixed on this machine.

Phase 1 verification notes:

- [x] `npm run typecheck` passed in `frontend/`.
- [x] `npm run build` passed in `frontend/`.
- [x] Frontend dev server returned HTTP 200 at `http://127.0.0.1:5173/`.
- [x] `npm run typecheck` passed in `backend/`.
- [x] `npm run build` passed in `backend/`.
- [x] `npm test` passed in `backend/`.
- [x] Backend connected to MongoDB and `GET /api/health` returned `status: ok`.
- [ ] Docker Compose plugin is not installed and legacy `docker-compose` is broken because Python `distutils` is missing; MongoDB was verified with a temporary `docker run` container instead.

## Phase 2: Auth and RBAC

### 2.1 User Model and Seed

- [x] Create user schema with name, email, password hash, role, status, and last login fields.
- [x] Add role enum: Admin, Engineer, Operator.
- [x] Add password hashing utility.
- [x] Add first Admin creation flow based on the answered doubt.

Test after completion:

- [x] Confirm duplicate emails are rejected.
- [x] Confirm passwords are stored hashed.
- [x] Confirm an Admin user can be created.

### 2.2 Authentication API

- [x] Implement login endpoint.
- [x] Implement current-user endpoint.
- [x] Implement logout response behavior if needed for frontend flow.
- [x] Add JWT signing and verification.

Test after completion:

- [x] Login succeeds with valid credentials.
- [x] Login fails with invalid credentials.
- [x] Current-user endpoint works only with a valid token.

### 2.3 Authorization Middleware

- [x] Add authentication middleware.
- [x] Add role-based middleware.
- [x] Add consistent unauthorized and forbidden errors.
- [x] Protect user management routes.

Test after completion:

- [x] Anonymous users cannot access protected routes.
- [x] Operator cannot perform Admin-only actions.
- [x] Admin can perform Admin-only actions.

### 2.4 Frontend Auth Flow

- [x] Add login page.
- [x] Add auth service.
- [x] Add auth state handling.
- [x] Add protected route wrapper.
- [x] Add role-aware navigation placeholders.

Test after completion:

- [x] Login redirects to dashboard.
- [x] Refresh keeps the user authenticated when token is valid.
- [x] Logout clears auth state.
- [x] Protected pages redirect anonymous users to login.

## Phase 3: Plant Hierarchy

### 3.1 Backend Hierarchy Models

- [x] Create plant model.
- [x] Create building model.
- [x] Create department model.
- [x] Create panel model.
- [x] Add references between hierarchy levels.
- [x] Add indexes for parent relationships and codes.

Test after completion:

- [x] Create a plant, building, department, and panel through API tests or API client.
- [x] Confirm child records require valid parent records.
- [x] Confirm duplicate codes are handled within the correct parent scope.

### 3.2 Hierarchy APIs

- [x] Add CRUD endpoints for plants.
- [x] Add CRUD endpoints for buildings.
- [x] Add CRUD endpoints for departments.
- [x] Add CRUD endpoints for panels.
- [x] Add tree endpoint for a full plant hierarchy.

Test after completion:

- [x] List endpoints support pagination and search where useful.
- [x] Tree endpoint returns nested plant, buildings, departments, and panels.
- [x] Role permissions match requirements.

### 3.3 Frontend Hierarchy Screens

- [ ] Add plants page.
- [ ] Add building, department, and panel management views.
- [ ] Add tree view page.
- [ ] Add create and edit forms.
- [ ] Add delete or deactivate confirmation.

Test after completion:

- [ ] Create hierarchy records from UI.
- [ ] Edit hierarchy records from UI.
- [ ] View nested hierarchy as a tree.
- [ ] Operator can view but not edit.

## Phase 4: Assets and Devices

### 4.1 Asset Backend

- [ ] Create asset model.
- [ ] Add asset CRUD endpoints.
- [ ] Add search, filters, sorting, and pagination.
- [ ] Add hierarchy assignment fields.
- [ ] Add asset status handling.

Test after completion:

- [ ] Create, update, list, view, and deactivate assets.
- [ ] Filter assets by category, status, plant, and panel.
- [ ] Search assets by name, manufacturer, model, and serial number.

### 4.2 Device Backend

- [ ] Create device configuration model.
- [ ] Link each device configuration to an asset.
- [ ] Add fields for IP address, port, protocol, Modbus address, communication type, polling interval, and status.
- [ ] Add device CRUD endpoints.
- [ ] Add simulated status updates.

Test after completion:

- [ ] Create a device configuration for an asset.
- [ ] Reject invalid protocol, port, and polling interval values.
- [ ] Change device status and confirm it appears in list responses.

### 4.3 Frontend Assets and Devices

- [ ] Add assets list page.
- [ ] Add asset form.
- [ ] Add asset details view.
- [ ] Add devices list page.
- [ ] Add device configuration form.
- [ ] Add status badges.

Test after completion:

- [ ] Manage assets from UI.
- [ ] Manage devices from UI.
- [ ] Confirm filters and search work from UI.
- [ ] Confirm role restrictions in UI.

## Phase 5: Maintenance

### 5.1 Maintenance Backend

- [ ] Create maintenance record model.
- [ ] Add maintenance CRUD endpoints.
- [ ] Add upcoming maintenance endpoint.
- [ ] Add overdue maintenance logic.
- [ ] Link maintenance records to assets.

Test after completion:

- [ ] Create maintenance records for assets.
- [ ] List maintenance records by asset and date.
- [ ] Confirm upcoming and overdue results are correct.

### 5.2 Maintenance Frontend

- [ ] Add maintenance list page.
- [ ] Add maintenance form.
- [ ] Add upcoming and overdue filters.
- [ ] Add maintenance information to asset details.

Test after completion:

- [ ] Add and edit maintenance records from UI.
- [ ] View upcoming and overdue maintenance.
- [ ] Operator can view but not edit.

## Phase 6: CSV Import and Export

### 6.1 CSV Import

- [ ] Add file upload middleware.
- [ ] Add CSV parser utility.
- [ ] Add asset import endpoint.
- [ ] Add device import endpoint.
- [ ] Validate required fields and parent references.
- [ ] Return row-level success and error results.

Test after completion:

- [ ] Import valid asset CSV.
- [ ] Import invalid CSV and confirm row-level errors.
- [ ] Confirm no partial bad rows are inserted.

### 6.2 CSV Export

- [ ] Add asset CSV export endpoint.
- [ ] Add device CSV export endpoint.
- [ ] Add maintenance CSV export endpoint.
- [ ] Apply current filters to exports where practical.

Test after completion:

- [ ] Export assets as CSV.
- [ ] Export devices as CSV.
- [ ] Export maintenance as CSV.
- [ ] Confirm exported files open correctly in spreadsheet software.

### 6.3 Import and Export Frontend

- [ ] Add import controls to assets and devices pages.
- [ ] Show import result summary.
- [ ] Show row-level import errors.
- [ ] Add export buttons for assets, devices, and maintenance.

Test after completion:

- [ ] Upload CSV from UI.
- [ ] See validation results from UI.
- [ ] Download CSV exports from UI.

## Phase 7: Dashboard

### 7.1 Dashboard Backend

- [ ] Add summary metrics endpoint.
- [ ] Add assets-by-category endpoint.
- [ ] Add device-status endpoint.
- [ ] Add maintenance summary endpoint.
- [ ] Add recent assets endpoint.

Test after completion:

- [ ] Confirm dashboard metrics match database records.
- [ ] Confirm empty database returns zero counts, not errors.
- [ ] Confirm role permissions allow all authenticated users to view dashboard.

### 7.2 Dashboard Frontend

- [ ] Add dashboard page.
- [ ] Add summary cards.
- [ ] Add charts.
- [ ] Add recent assets list.
- [ ] Add maintenance due section.

Test after completion:

- [ ] Dashboard renders with empty state.
- [ ] Dashboard updates after creating assets and devices.
- [ ] Charts render without layout issues.

## Phase 8: Frontend Completion and Polish

### 8.1 Shared UI Components

- [ ] Add app layout with sidebar and top bar.
- [ ] Add reusable table component.
- [ ] Add reusable form controls.
- [ ] Add reusable modal or side panel.
- [ ] Add badges, buttons, loading states, empty states, and error states.

Test after completion:

- [ ] Every main page uses consistent layout.
- [ ] Loading, empty, and error states are visible where needed.
- [ ] Text does not overflow common UI controls.

### 8.2 Navigation and Role Experience

- [ ] Add final navigation items.
- [ ] Hide disallowed actions by role.
- [ ] Keep backend as the source of truth for permissions.
- [ ] Add settings/profile placeholder if final settings are not implemented yet.

Test after completion:

- [ ] Admin sees all management options.
- [ ] Engineer sees configuration workflows.
- [ ] Operator sees read-only workflows.

## Phase 9: Testing

### 9.1 Backend Tests

- [ ] Add test setup.
- [ ] Add auth tests.
- [ ] Add RBAC tests.
- [ ] Add hierarchy tests.
- [ ] Add asset and device tests.
- [ ] Add maintenance tests.
- [ ] Add import and export tests.
- [ ] Add dashboard tests.

Test after completion:

- [ ] Run backend test suite successfully.
- [ ] Confirm tests can run on a clean machine using documented setup.

### 9.2 Frontend Tests

- [ ] Add frontend test setup.
- [ ] Add login workflow tests.
- [ ] Add protected route tests.
- [ ] Add form validation tests for critical forms.
- [ ] Add table empty and loading state tests.

Test after completion:

- [ ] Run frontend test suite successfully.
- [ ] Confirm critical workflows are covered.

## Phase 10: Docker, Deployment, and Demo

### 10.1 Docker

- [ ] Add backend Dockerfile.
- [ ] Add frontend Dockerfile.
- [ ] Add root Docker Compose for frontend, backend, and MongoDB.
- [ ] Add environment variable documentation.

Test after completion:

- [ ] Run full stack with Docker Compose.
- [ ] Confirm frontend can call backend.
- [ ] Confirm backend can call MongoDB.

### 10.2 Final Documentation

- [ ] Write root README.
- [ ] Write setup guide.
- [ ] Write API usage notes.
- [ ] Write deployment notes.
- [ ] Add demo script.

Test after completion:

- [ ] Follow README from a clean checkout.
- [ ] Confirm setup instructions are accurate.
- [ ] Confirm demo script matches implemented features.

### 10.3 Final Demo Readiness

- [ ] Add sample data or seed script.
- [ ] Capture screenshots.
- [ ] Prepare project explanation for interviews.
- [ ] Verify the application works end to end.

Test after completion:

- [ ] Login as Admin, Engineer, and Operator.
- [ ] Create plant hierarchy.
- [ ] Create assets and devices.
- [ ] Add maintenance.
- [ ] Import and export CSV.
- [ ] View dashboard and hierarchy tree.

## Phase 3 Implementation Notes and Doubts

- Should the hierarchy tree be exposed as a single `/api/hierarchy/tree` endpoint, or would you prefer separate tree endpoints per level for easier frontend consumption?
seperate tree end points would be good
- For the initial v1 scope, should Operators be allowed to view hierarchy data but not create or edit it, or should they be completely blocked from all management actions?
opertors can view that it, not create or edit it, they shoukd not be blocked
- Would you like the frontend hierarchy views to use the same list/detail/create/edit pattern as the rest of the app, or should the first pass be a simpler tree-focused screen with inline create forms?
as rest of the app, but tree focused screen will be good

## Resolved Decisions

- First Admin and demo data should come from a static seed/bootstrap flow.
- Tailwind CSS is the frontend styling foundation.
- Docker Compose belongs in Phase 1 so local testing is easier.
- Demo seed data should be included from the beginning of feature development.
- Business records should use inactive/deleted status instead of physical deletion where practical.

## Codex Doubts Before Phase 2

- Should the Phase 2 seed run automatically every server start in development, or only when a seed script is executed?
every server start in development
- Should JWT be stored in localStorage for simplicity, or should we use httpOnly cookies for better security?
just localstorage, remember i just want a simple application for now
- What default seed login should we use for Admin, Engineer, and Operator test users?
create a seed management folder may be like in jsons which gets bootstrapped, and see login anything that works and will work for demo thats it, you have freedom to choose anything

i have also fixed the docker compose and have verified also it is working.