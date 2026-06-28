# Vision

## Project Title

Industrial Asset Configuration and Device Management Platform for Energy Management Systems

## Problem

Industrial plants often maintain asset and device configuration details in spreadsheets, handwritten records, and disconnected tools. Before an Energy Management System can monitor energy usage, smart meters, panels, PLCs, gateways, motors, pumps, compressors, and other assets must be registered and configured correctly.

Common problems include duplicate records, incorrect meter assignments, wrong communication settings, missing documentation, difficult maintenance tracking, and no centralized source of truth.

## Solution

Build a centralized web platform that lets teams register plants, model their hierarchy, manage industrial assets, configure devices, track maintenance, and prepare clean configuration data for a larger EMS platform.

This application acts as the configuration layer for the EMS. It does not collect live energy data in v1, but it stores the asset and device information that future monitoring, analytics, alarms, and reports will depend on.

## Target Users

- Admin: manages users, roles, plants, assets, and system settings.
- Engineer: configures devices, manages asset details, imports inventory, and updates maintenance data.
- Operator: views plant hierarchy, asset inventory, device status, and dashboard summaries.

## Current Scope

- Authentication and role-based access control.
- Plant hierarchy management.
- Asset registration and inventory.
- Device configuration for meters, PLCs, gateways, and related equipment.
- Simulated device status such as online, offline, maintenance, and inactive.
- Maintenance records and upcoming maintenance tracking.
- Search, filter, import, and export workflows.
- Dashboard summaries and charts.
- Audit logs for important changes.

## Out of Scope for v1

- Live meter polling.
- Real SCADA integration.
- Real-time energy analytics.
- Alarm notification delivery.
- Mobile applications.
- Predictive maintenance.
- Multi-tenant billing.
- Production-grade IoT protocol handling.

## Future Scope

- Live EMS monitoring.
- Energy analytics and reporting.
- Alert and alarm system.
- SCADA, OPC-UA, MQTT, and Modbus integration.
- Mobile app for operators.
- Advanced role policies and approval workflows.
- Integration with ERP or maintenance management systems.
