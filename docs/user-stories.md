# User Stories

## Admin

- As an Admin, I want to create user accounts so that team members can access the platform.
- As an Admin, I want to assign roles so that each user has the correct permissions.
- As an Admin, I want to create plants so that engineers can register assets for each site.
- As an Admin, I want to manage plant hierarchy so that assets are organized by building, department, and panel.
- As an Admin, I want to view audit logs so that I can track important system changes.
- As an Admin, I want to export configuration data so that it can be reviewed or shared outside the application.

## Engineer

- As an Engineer, I want to register an asset so that it becomes part of the central inventory.
- As an Engineer, I want to configure Modbus and network settings so that the EMS can communicate with devices later.
- As an Engineer, I want to assign assets to hierarchy nodes so that the plant structure is accurate.
- As an Engineer, I want to import asset records from CSV so that large inventories can be added quickly.
- As an Engineer, I want to see validation errors during import so that I can fix bad rows.
- As an Engineer, I want to add maintenance records so that service history is available for each asset.
- As an Engineer, I want to search by manufacturer, model, serial number, or panel so that I can find devices quickly.

## Operator

- As an Operator, I want to view the dashboard so that I can understand the current asset and device summary.
- As an Operator, I want to browse the plant hierarchy so that I can locate assets by area.
- As an Operator, I want to view device status so that I can identify offline or maintenance devices.
- As an Operator, I want to view maintenance due dates so that I know which assets need attention.
- As an Operator, I want read-only access so that I cannot accidentally change configuration data.

## System

- As the system, I want to require authentication for protected routes so that private data is not exposed.
- As the system, I want to enforce role permissions so that users cannot perform unauthorized actions.
- As the system, I want to validate submitted data so that records remain consistent.
- As the system, I want to log important changes so that administrators can trace activity.
