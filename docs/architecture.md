# Architecture

## Stack

- Frontend: React, Vite, TypeScript, React Router, React Query, React Hook Form, Tailwind CSS.
- Backend: Node.js, Express, TypeScript.
- Database: MongoDB with Mongoose.
- Authentication: JWT access tokens, hashed passwords, role-based access control.
- Infrastructure: Docker, Docker Compose, environment-based configuration.

## High-Level Flow

```text
React Frontend
    |
    | REST API over HTTP
    v
Express Backend
    |
    | Mongoose models and repositories
    v
MongoDB
```

## Frontend Architecture

The frontend should be organized by features and shared UI utilities.

```text
frontend/
  src/
    app/
    components/
    features/
      auth/
      dashboard/
      plants/
      assets/
      devices/
      maintenance/
      users/
    hooks/
    services/
    types/
    utils/
```

Frontend responsibilities:

- Render login, dashboard, plant hierarchy, assets, devices, maintenance, users, and settings pages.
- Call backend REST APIs through service functions.
- Manage server state with React Query.
- Manage forms with React Hook Form and validation schemas.
- Protect routes based on authentication state and role.
- Display loading, empty, error, and success states.

## Backend Architecture

The backend should use feature modules instead of one large controllers/models folder.

```text
backend/
  src/
    modules/
      auth/
      users/
      plants/
      assets/
      devices/
      maintenance/
      dashboard/
      imports/
      exports/
      audit-logs/
    shared/
      config/
      database/
      middleware/
      utils/
      logger/
    app.ts
    server.ts
```

Each module should contain its own routes, controller, service, model, validation, and tests where needed.

## Backend Layers

- Routes define HTTP paths and middleware.
- Controllers translate HTTP requests into service calls.
- Services contain business logic.
- Models define MongoDB schemas and validation.
- Shared middleware handles auth, RBAC, errors, request logging, and file upload.

## Core Data Flow

1. User logs in from React.
2. Backend verifies credentials and returns a JWT.
3. Frontend stores authentication state.
4. Frontend sends JWT with protected API requests.
5. Backend validates JWT and role permissions.
6. Backend reads or writes MongoDB documents.
7. Backend returns a consistent JSON response.
8. Frontend updates tables, forms, dashboards, and charts.

## Cross-Cutting Concerns

- JWT authentication protects private APIs.
- RBAC restricts actions by role.
- Backend validation protects database quality.
- Audit logging records important mutations.
- File upload supports CSV import.
- Central error handling keeps API errors consistent.
- Docker Compose supports local development with MongoDB.
