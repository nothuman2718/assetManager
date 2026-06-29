import { Router } from 'express';
import express from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';

import { requireAuth, requireRoles } from '../../shared/middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { parseCsv, type ImportResult } from '../../shared/utils/csv.js';
import type { AssetStatus } from '../assets/asset.model.js';
import { AssetModel } from '../assets/asset.model.js';
import type { DeviceStatus } from '../assets/device.model.js';
import { DeviceModel } from '../assets/device.model.js';
import { BuildingModel } from '../hierarchy/building.model.js';
import { DepartmentModel } from '../hierarchy/department.model.js';
import { PanelModel } from '../hierarchy/panel.model.js';
import { PlantModel } from '../hierarchy/plant.model.js';

export const importsRouter = Router();

const csvBodyParser = (limit = '1mb') => [
  requireAuth,
  requireRoles('Admin', 'Engineer'),
  express.text({ type: ['text/csv', 'text/plain', 'application/csv'], limit }),
];

const assetStatusSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.enum(['active', 'inactive', 'maintenance']).optional(),
);

const deviceStatusSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.enum(['online', 'offline', 'maintenance', 'disabled']).optional(),
);

const assetRowSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  category: z.string().min(2),
  manufacturer: z.string().min(2),
  model: z.string().min(2),
  serialNumber: z.string().min(2),
  plantId: z.string().optional(),
  buildingId: z.string().optional(),
  departmentId: z.string().optional(),
  panelId: z.string().optional(),
  status: assetStatusSchema,
});

const deviceRowSchema = z.object({
  assetId: z.string().min(1),
  name: z.string().min(2),
  ipAddress: z.string().optional(),
  protocol: z.enum(['ModbusTCP', 'ModbusRTU', 'EthernetIP', 'OPC-UA']),
  port: z.coerce.number().int().min(1).max(65535),
  modbusAddress: z.coerce.number().int().min(1).max(247).optional(),
  communicationType: z.string().min(2),
  pollingInterval: z.coerce.number().int().min(5).max(3600),
  status: deviceStatusSchema,
});

const clean = (value?: string) => value?.trim() || undefined;

const validateHierarchyReferences = async (payload: {
  plantId?: string;
  buildingId?: string;
  departmentId?: string;
  panelId?: string;
}) => {
  const checks: Array<Promise<unknown>> = [];

  if (clean(payload.plantId)) checks.push(PlantModel.exists({ _id: payload.plantId, status: { $ne: 'deleted' } }));
  if (clean(payload.buildingId)) checks.push(BuildingModel.exists({ _id: payload.buildingId, status: { $ne: 'deleted' } }));
  if (clean(payload.departmentId)) checks.push(DepartmentModel.exists({ _id: payload.departmentId, status: { $ne: 'deleted' } }));
  if (clean(payload.panelId)) checks.push(PanelModel.exists({ _id: payload.panelId, status: { $ne: 'deleted' } }));

  const results = await Promise.all(checks);
  return results.every(Boolean);
};

importsRouter.post(
  '/assets',
  ...csvBodyParser(),
  asyncHandler(async (request, response) => {
    const rows = parseCsv(String(request.body ?? ''));
    const results: ImportResult[] = [];

    for (const [index, row] of rows.entries()) {
      const parsed = assetRowSchema.safeParse(row);

      if (!parsed.success) {
        results.push({
          row: index + 2,
          success: false,
          errors: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
        });
        continue;
      }

      const payload = parsed.data;
      const code = payload.code.trim().toUpperCase();
      const existing = await AssetModel.findOne({ code }).exec();

      if (existing) {
        results.push({ row: index + 2, success: false, errors: ['Asset code already exists'] });
        continue;
      }

      const invalidReference = [payload.plantId, payload.buildingId, payload.departmentId, payload.panelId]
        .filter(Boolean)
        .some((value) => !Types.ObjectId.isValid(String(value)));

      if (invalidReference) {
        results.push({ row: index + 2, success: false, errors: ['One or more hierarchy references are invalid ObjectIds'] });
        continue;
      }

      const hierarchyReferencesExist = await validateHierarchyReferences(payload);
      if (!hierarchyReferencesExist) {
        results.push({ row: index + 2, success: false, errors: ['One or more hierarchy references were not found'] });
        continue;
      }

      const asset = await AssetModel.create({
        name: payload.name.trim(),
        code,
        category: payload.category.trim(),
        manufacturer: payload.manufacturer.trim(),
        model: payload.model.trim(),
        serialNumber: payload.serialNumber.trim(),
        plantId: clean(payload.plantId) ?? null,
        buildingId: clean(payload.buildingId) ?? null,
        departmentId: clean(payload.departmentId) ?? null,
        panelId: clean(payload.panelId) ?? null,
        status: (payload.status ?? 'active') as AssetStatus,
      });

      results.push({ row: index + 2, success: true, id: asset.id });
    }

    response.status(200).json({
      data: {
        totalRows: rows.length,
        successCount: results.filter((result) => result.success).length,
        errorCount: results.filter((result) => !result.success).length,
        results,
      },
    });
  }),
);

importsRouter.post(
  '/devices',
  ...csvBodyParser(),
  asyncHandler(async (request, response) => {
    const rows = parseCsv(String(request.body ?? ''));
    const results: ImportResult[] = [];

    for (const [index, row] of rows.entries()) {
      const parsed = deviceRowSchema.safeParse(row);

      if (!parsed.success) {
        results.push({
          row: index + 2,
          success: false,
          errors: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
        });
        continue;
      }

      const payload = parsed.data;

      if (!Types.ObjectId.isValid(payload.assetId)) {
        results.push({ row: index + 2, success: false, errors: ['Invalid asset id'] });
        continue;
      }

      const asset = await AssetModel.findOne({ _id: payload.assetId, status: { $ne: 'deleted' } }).exec();
      if (!asset) {
        results.push({ row: index + 2, success: false, errors: ['Asset not found'] });
        continue;
      }

      const device = await DeviceModel.create({
        assetId: payload.assetId,
        name: payload.name.trim(),
        ipAddress: clean(payload.ipAddress),
        protocol: payload.protocol,
        port: payload.port,
        modbusAddress: payload.modbusAddress,
        communicationType: payload.communicationType.trim(),
        pollingInterval: payload.pollingInterval,
        status: (payload.status ?? 'online') as DeviceStatus,
      });

      results.push({ row: index + 2, success: true, id: device.id });
    }

    response.status(200).json({
      data: {
        totalRows: rows.length,
        successCount: results.filter((result) => result.success).length,
        errorCount: results.filter((result) => !result.success).length,
        results,
      },
    });
  }),
);
