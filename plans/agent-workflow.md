# Agent Workflow

## Working Style

Treat the project like a small product team. Each agent role should work from the same documentation and produce focused deliverables that feed the next role.

## Agent Roles

| Agent | Responsibility | Deliverables |
| --- | --- | --- |
| Product Manager | Own scope, requirements, user value, and backlog | Vision, requirements, user stories, prioritized tasks |
| Solution Architect | Own system structure and technical decisions | Architecture, folder structure, API boundaries, integration flow |
| Database Engineer | Own MongoDB design | Collections, Mongoose schema plan, indexes, validation rules |
| Backend Engineer | Own Express API implementation | Routes, controllers, services, models, middleware, tests |
| Frontend Engineer | Own React UI implementation | Pages, components, API integration, forms, state handling |
| UI/UX Designer | Own screen structure and usability | Wireframes, layout rules, component inventory |
| QA Engineer | Own quality checks | Test plan, API test cases, UI workflow tests, edge cases |
| DevOps Engineer | Own local and deployment setup | Docker Compose, environment docs, CI/CD plan, deployment notes |
| Technical Writer | Own final project explanation | README, setup docs, API docs, demo script |

## Workflow

```text
Product Manager
  -> Solution Architect
  -> Database Engineer
  -> Backend Engineer
  -> Frontend Engineer
  -> QA Engineer
  -> DevOps Engineer
  -> Technical Writer
```

## Rules for Agent-Based Development

- Start each phase by reading the docs.
- Keep each agent focused on one responsibility.
- Do not mix large backend, frontend, and deployment tasks in the same prompt.
- Ask each agent to produce files or tasks that the next agent can use.
- Review completed work before moving to the next phase.
- Keep the project narrative consistent: this is an EMS asset configuration module.

## Suggested Agent Prompts

### Product Manager

Use the docs to convert the EMS asset registry scope into a prioritized backlog. Keep v1 realistic and separate must-have, should-have, and future features.

### Solution Architect

Use the docs to define the MERN architecture, folder structure, module boundaries, request flow, and security flow. Keep the design modular and implementation-ready.

### Database Engineer

Use the database doc to create detailed Mongoose schema tasks for users, plants, buildings, departments, panels, assets, device configurations, maintenance records, documents, and audit logs.

### Backend Engineer

Use the API and database docs to implement one backend module at a time. Include validation, auth middleware, RBAC, error handling, and tests.

### Frontend Engineer

Use the UI wireframes and API docs to build one frontend feature at a time. Include forms, tables, filters, loading states, empty states, and role-aware actions.

### QA Engineer

Create test cases for authentication, RBAC, CRUD flows, hierarchy assignment, device configuration, import validation, exports, dashboard metrics, and frontend workflows.

### DevOps Engineer

Create Docker, environment, and deployment setup after the app structure exists. Make sure a developer can run the full stack locally.

### Technical Writer

Prepare final README, setup guide, API usage notes, architecture explanation, and demo script after the main implementation is complete.
