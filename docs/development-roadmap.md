# Development Roadmap

## Phase 0: Documentation

- Create vision, requirements, user stories, architecture, database, API, UI wireframe, and roadmap docs.
- Create planning files for documentation tasks, agent workflow, and build phases.
- Use docs as the source of truth before coding.

## Phase 1: Project Setup

- Create frontend React Vite TypeScript app.
- Create backend Node.js Express TypeScript app.
- Add shared linting and formatting configuration.
- Add environment variable examples.
- Add Docker Compose with MongoDB.

## Phase 2: Authentication and RBAC

- Implement user model.
- Implement registration or admin user seed.
- Implement login and JWT authentication.
- Implement role middleware for Admin, Engineer, and Operator.
- Protect frontend routes.

## Phase 3: Plant Hierarchy

- Implement plants, buildings, departments, and panels.
- Add hierarchy API.
- Add basic frontend pages for hierarchy management.

## Phase 4: Assets and Devices

- Implement asset CRUD with search, filters, and pagination.
- Implement device configuration CRUD.
- Link devices to assets and hierarchy nodes.
- Add simulated device status.

## Phase 5: Maintenance

- Implement maintenance records.
- Add upcoming and overdue maintenance logic.
- Connect maintenance summary to dashboard.

## Phase 6: Import and Export

- Implement CSV import for assets and devices.
- Validate imported rows and return row-level errors.
- Implement CSV export for assets, devices, and maintenance.

## Phase 7: Dashboard

- Implement summary metrics.
- Implement asset category, device status, and maintenance chart APIs.
- Build frontend dashboard cards and charts.

## Phase 8: React Frontend

- Build final page layouts.
- Add reusable tables, forms, modals, filters, and status badges.
- Integrate all frontend pages with backend APIs.
- Improve responsive behavior.

## Phase 9: Testing

- Add backend unit and integration tests for core modules.
- Add frontend component and workflow tests for important screens.
- Test RBAC behavior.
- Test import validation and error cases.

## Phase 10: Docker, Deployment, and Demo

- Finalize Docker Compose for local full-stack startup.
- Prepare production deployment notes.
- Write README setup instructions.
- Prepare demo script and screenshots.
- Verify the project can be explained as an EMS configuration module, not just a CRUD app.
