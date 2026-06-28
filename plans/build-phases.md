# Build Phases

## Phase 0: Documentation

- Create the initial `docs/` and `plans/` folders.
- Write product, requirements, architecture, database, API, UI, and roadmap docs.
- Review docs and convert approved scope into coding tasks.

## Phase 1: Project Setup

- Initialize the repository structure.
- Set up React Vite TypeScript frontend.
- Set up Node.js Express TypeScript backend.
- Add MongoDB connection setup.
- Add Docker Compose for local MongoDB.
- Add environment variable examples.

## Phase 2: Auth and RBAC

- Add user model and authentication routes.
- Add password hashing and JWT login.
- Add auth middleware.
- Add role middleware for Admin, Engineer, and Operator.
- Add protected frontend routing.

## Phase 3: Plant Hierarchy

- Build plants module.
- Build buildings module.
- Build departments module.
- Build panels module.
- Build hierarchy API.
- Build frontend hierarchy management screens.

## Phase 4: Assets and Devices

- Build assets module with CRUD, search, filters, and pagination.
- Build device configuration module.
- Link devices to assets.
- Add simulated device status.
- Build frontend tables and forms.

## Phase 5: Maintenance

- Build maintenance records module.
- Add upcoming and overdue maintenance logic.
- Build maintenance frontend page.
- Connect maintenance data to dashboard.

## Phase 6: Import and Export

- Add CSV upload flow.
- Parse and validate CSV rows.
- Return row-level import errors.
- Add CSV export for assets, devices, and maintenance.
- Add frontend import and export controls.

## Phase 7: Dashboard

- Add dashboard summary APIs.
- Add chart data APIs.
- Build dashboard cards.
- Build charts for asset category, device status, and maintenance.

## Phase 8: React Frontend

- Complete navigation shell and page layouts.
- Build reusable components for tables, forms, filters, badges, modals, and empty states.
- Integrate all API services with React Query.
- Add responsive behavior and UI polish.

## Phase 9: Testing

- Add backend tests for auth, RBAC, hierarchy, assets, devices, maintenance, imports, and dashboard.
- Add frontend tests for login, protected routes, forms, tables, and main workflows.
- Test validation, permission errors, and empty states.

## Phase 10: Docker, Deployment, and Demo

- Add Docker Compose for frontend, backend, and MongoDB.
- Add deployment notes for frontend, backend, and MongoDB.
- Add production environment variable notes.
- Write README and setup guide.
- Prepare demo script, screenshots, and final project explanation.
