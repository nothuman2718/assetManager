# UI Wireframes

These are rough layout notes, not final visual designs.

## Login

```text
------------------------------------------------
| Product name                                  |
| Email input                                   |
| Password input                                |
| Login button                                  |
| Error message area                            |
------------------------------------------------
```

## Dashboard

```text
------------------------------------------------
| Sidebar | Top bar                             |
|         | Summary cards                       |
|         | Total plants | Assets | Devices     |
|         | Online | Offline | Maintenance Due |
|         | Charts                              |
|         | Recent assets / maintenance list    |
------------------------------------------------
```

## Plants

```text
------------------------------------------------
| Sidebar | Plants header | Add plant button    |
|         | Search and filters                  |
|         | Plants table                        |
|         | Create/edit plant side panel        |
------------------------------------------------
```

## Plant Hierarchy

```text
------------------------------------------------
| Sidebar | Hierarchy header | Plant selector   |
|         | Tree view                           |
|         | Plant                               |
|         |   Building                          |
|         |     Department                      |
|         |       Panel                         |
|         |         Asset                       |
|         | Details panel for selected node     |
------------------------------------------------
```

## Assets

```text
------------------------------------------------
| Sidebar | Assets header | Add asset button    |
|         | Search | Category | Status filters  |
|         | Asset table                         |
|         | Name | Category | Location | Status |
|         | Asset form modal or side panel      |
------------------------------------------------
```

## Devices

```text
------------------------------------------------
| Sidebar | Devices header | Add device button  |
|         | Search | Protocol | Status filters  |
|         | Device table                        |
|         | Asset | IP | Port | Protocol | State |
|         | Device configuration form           |
------------------------------------------------
```

## Maintenance

```text
------------------------------------------------
| Sidebar | Maintenance header                  |
|         | Upcoming / overdue summary          |
|         | Maintenance table                   |
|         | Asset | Technician | Next date      |
|         | Maintenance form                    |
------------------------------------------------
```

## Users

```text
------------------------------------------------
| Sidebar | Users header | Add user button      |
|         | Search | Role | Status filters      |
|         | Users table                         |
|         | User form with role selector        |
------------------------------------------------
```

## Settings

```text
------------------------------------------------
| Sidebar | Settings header                     |
|         | Organization settings               |
|         | Import/export settings              |
|         | Profile/security section            |
------------------------------------------------
```

## Common UI States

- Loading state for all API-driven screens.
- Empty state for tables with no records.
- Error state for failed API requests.
- Confirmation modal for destructive actions.
- Toast notifications for successful create, update, delete, import, and export actions.
