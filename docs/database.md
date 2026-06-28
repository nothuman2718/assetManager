# Database Design

## Database

MongoDB will store application data using Mongoose models. Documents should use timestamps and soft delete fields where useful.

## Collections

### users

Stores platform users.

Important fields:

- name
- email
- passwordHash
- role
- status
- lastLoginAt

Indexes:

- unique email
- role
- status

Validation:

- email must be unique and valid.
- role must be Admin, Engineer, or Operator.
- passwordHash is required.

### plants

Stores industrial plants or sites.

Important fields:

- name
- code
- address
- city
- state
- country
- status
- remarks

Indexes:

- unique code
- name
- status

### buildings

Stores buildings inside a plant.

Important fields:

- plantId
- name
- code
- floorCount
- status

Indexes:

- plantId
- plantId and code

### departments

Stores departments inside buildings.

Important fields:

- plantId
- buildingId
- name
- code
- status

Indexes:

- plantId
- buildingId
- buildingId and code

### panels

Stores electrical panels inside departments.

Important fields:

- plantId
- buildingId
- departmentId
- name
- code
- panelType
- status

Indexes:

- plantId
- departmentId
- departmentId and code

### assets

Stores industrial assets.

Important fields:

- name
- category
- manufacturer
- model
- serialNumber
- installationDate
- status
- plantId
- buildingId
- departmentId
- panelId
- remarks

Indexes:

- serialNumber
- category
- status
- plantId
- panelId
- manufacturer and model

Validation:

- name, category, and plantId are required.
- serialNumber should be unique when present.
- status must use an allowed value.

### deviceConfigs

Stores communication and configuration details for devices.

Important fields:

- assetId
- deviceType
- ipAddress
- port
- protocol
- modbusAddress
- communicationType
- pollingIntervalSeconds
- status

Indexes:

- assetId
- protocol
- status
- ipAddress and port

Validation:

- assetId is required.
- protocol must use an allowed value such as Modbus TCP, Modbus RTU, MQTT, OPC-UA, or Other.
- polling interval must be positive.

### maintenanceRecords

Stores service and inspection history.

Important fields:

- assetId
- lastInspectionDate
- lastServiceDate
- warrantyUntil
- technician
- nextMaintenanceDate
- status
- notes

Indexes:

- assetId
- nextMaintenanceDate
- status

### auditLogs

Stores important user and system actions.

Important fields:

- actorUserId
- action
- entityType
- entityId
- before
- after
- ipAddress
- userAgent
- createdAt

Indexes:

- actorUserId
- entityType and entityId
- action
- createdAt

### documents

Stores metadata for uploaded files.

Important fields:

- fileName
- originalName
- mimeType
- size
- storagePath
- entityType
- entityId
- uploadedBy

Indexes:

- entityType and entityId
- uploadedBy

## Relationships

```text
Plant
  -> Building
    -> Department
      -> Panel
        -> Asset
          -> Device Configuration
          -> Maintenance Records
```

Users create and update records. Audit logs reference the user and the changed entity.

## Deletion Strategy

Prefer soft deletion or inactive status for business records so historical configuration and audit trails remain available.
