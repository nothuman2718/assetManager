# API Design

## Conventions

- Base path: `/api`
- Request and response format: JSON
- Protected APIs require `Authorization: Bearer <token>`
- List endpoints support pagination with `page` and `limit`
- List endpoints support search with `search`
- Errors return a consistent error object with message and optional details

## Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Users

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `PATCH /api/users/:id/status`
- `DELETE /api/users/:id`

## Plants

- `GET /api/plants`
- `POST /api/plants`
- `GET /api/plants/:id`
- `PUT /api/plants/:id`
- `DELETE /api/plants/:id`

## Buildings

- `GET /api/buildings`
- `POST /api/buildings`
- `GET /api/buildings/:id`
- `PUT /api/buildings/:id`
- `DELETE /api/buildings/:id`

## Departments

- `GET /api/departments`
- `POST /api/departments`
- `GET /api/departments/:id`
- `PUT /api/departments/:id`
- `DELETE /api/departments/:id`

## Panels

- `GET /api/panels`
- `POST /api/panels`
- `GET /api/panels/:id`
- `PUT /api/panels/:id`
- `DELETE /api/panels/:id`

## Hierarchy

- `GET /api/hierarchy`
- `GET /api/hierarchy/plants/:plantId`
- `PATCH /api/hierarchy/assets/:assetId/move`

## Assets

- `GET /api/assets`
- `POST /api/assets`
- `GET /api/assets/:id`
- `PUT /api/assets/:id`
- `PATCH /api/assets/:id/status`
- `DELETE /api/assets/:id`

## Device Configurations

- `GET /api/devices`
- `POST /api/devices`
- `GET /api/devices/:id`
- `PUT /api/devices/:id`
- `PATCH /api/devices/:id/status`
- `DELETE /api/devices/:id`

## Maintenance

- `GET /api/maintenance`
- `POST /api/maintenance`
- `GET /api/maintenance/:id`
- `PUT /api/maintenance/:id`
- `DELETE /api/maintenance/:id`
- `GET /api/maintenance/upcoming`

## Dashboard

- `GET /api/dashboard/summary`
- `GET /api/dashboard/assets-by-category`
- `GET /api/dashboard/device-status`
- `GET /api/dashboard/maintenance`
- `GET /api/dashboard/recent-assets`

## Imports

- `POST /api/imports/assets`
- `POST /api/imports/devices`
- `GET /api/imports/:id`

## Exports

- `GET /api/exports/assets.csv`
- `GET /api/exports/devices.csv`
- `GET /api/exports/maintenance.csv`

## Audit Logs

- `GET /api/audit-logs`
- `GET /api/audit-logs/:id`

## Settings

- `GET /api/settings`
- `PUT /api/settings`
