# Requirements

## Functional Requirements

### Authentication and Users

- Users can log in using email and password.
- Users can log out securely.
- Admins can create, update, deactivate, and list users.
- Users have one role: Admin, Engineer, or Operator.
- Protected pages and APIs require authentication.

### Role-Based Access Control

- Admin can manage all records and users.
- Engineer can manage plants, assets, devices, maintenance, imports, and exports.
- Operator can view dashboards, hierarchy, assets, devices, and maintenance records.
- Restricted actions must be blocked both in the frontend and backend.

### Plant Hierarchy

- Users can create and manage plants.
- Plants can contain buildings.
- Buildings can contain departments.
- Departments can contain electrical panels.
- Assets can be assigned to a specific hierarchy node.
- Users can view the hierarchy as a tree.

### Asset Management

- Users can register industrial assets such as transformers, panels, motors, compressors, pumps, generators, meters, gateways, and PLCs.
- Each asset stores name, category, manufacturer, model, serial number, installation date, status, location, and remarks.
- Users can search, filter, sort, paginate, create, update, and deactivate assets.

### Device Configuration

- Users can create device configuration records for smart meters, gateways, PLCs, and related devices.
- Device settings include IP address, port, protocol, Modbus address, communication type, polling interval, and status.
- Devices can be linked to assets and hierarchy nodes.
- Device status can be simulated as online, offline, maintenance, or inactive.

### Maintenance

- Users can create maintenance records for assets.
- Maintenance records include last inspection date, last service date, warranty details, technician, next maintenance date, notes, and status.
- Dashboard should show upcoming and overdue maintenance.

### Search and Filters

- Users can search by device name, asset name, panel, building, manufacturer, model, serial number, and status.
- List pages should support filters and pagination.

### Import and Export

- Engineers and Admins can import asset and device records from CSV.
- Import should validate rows and report errors.
- Users can export inventory, maintenance, and configuration data as CSV.
- PDF or Excel export can be added after the CSV workflow is stable.

### Dashboard

- Dashboard displays total plants, buildings, assets, devices, online devices, offline devices, maintenance due, and recent assets.
- Dashboard includes charts for assets by category, assets by location, device status, and maintenance status.

### Audit Logs

- Important actions such as create, update, delete, import, export, login, and role changes are logged.
- Admins can view audit logs.

## Non-Functional Requirements

- Frontend uses React with Vite and TypeScript.
- Backend uses Node.js, Express, and TypeScript.
- Database uses MongoDB with Mongoose.
- APIs follow REST conventions.
- Authentication uses JWT access tokens.
- Passwords are hashed before storage.
- Validation is enforced in frontend forms and backend APIs.
- API responses use consistent success and error formats.
- UI is responsive for desktop and tablet use.
- Backend is organized by feature modules.
- Docker Compose can run frontend, backend, and MongoDB locally.
- Environment variables are used for secrets and runtime configuration.
- Logs should be useful for debugging and audit trails.
- Tests should cover critical backend services, API routes, and frontend workflows.
