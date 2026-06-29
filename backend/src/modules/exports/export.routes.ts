import { Router } from 'express';
import type { Response } from 'express';

import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { toCsv } from '../../shared/utils/csv.js';
import { AssetModel } from '../assets/asset.model.js';
import { DeviceModel } from '../assets/device.model.js';
import { MaintenanceRecordModel } from '../maintenance/maintenance.model.js';

export const exportsRouter = Router();

exportsRouter.use(requireAuth);

const sendCsv = (response: Response, filename: string, csv: string) => {
  response.setHeader('Content-Type', 'text/csv; charset=utf-8');
  response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  response.status(200).send(csv);
};

exportsRouter.get(
  '/assets.csv',
  asyncHandler(async (request, response) => {
    const filter: Record<string, unknown> = { status: { $ne: 'deleted' } };
    const status = String(request.query.status ?? '').trim();
    const category = String(request.query.category ?? '').trim();

    if (status) filter.status = status;
    if (category) filter.category = { $regex: category, $options: 'i' };

    const assets = await AssetModel.find(filter).sort({ createdAt: -1 }).exec();
    const csv = toCsv(
      ['id', 'name', 'code', 'category', 'manufacturer', 'model', 'serialNumber', 'plantId', 'buildingId', 'departmentId', 'panelId', 'status', 'createdAt'],
      assets.map((asset) => asset.toJSON()),
    );

    sendCsv(response, 'assets.csv', csv);
  }),
);

exportsRouter.get(
  '/devices.csv',
  asyncHandler(async (request, response) => {
    const filter: Record<string, unknown> = {};
    const status = String(request.query.status ?? '').trim();
    const protocol = String(request.query.protocol ?? '').trim();
    const assetId = String(request.query.assetId ?? '').trim();

    if (status) filter.status = status;
    if (protocol) filter.protocol = protocol;
    if (assetId) filter.assetId = assetId;

    const devices = await DeviceModel.find(filter).sort({ createdAt: -1 }).exec();
    const csv = toCsv(
      ['id', 'assetId', 'name', 'ipAddress', 'protocol', 'port', 'modbusAddress', 'communicationType', 'pollingInterval', 'status', 'createdAt'],
      devices.map((device) => device.toJSON()),
    );

    sendCsv(response, 'devices.csv', csv);
  }),
);

exportsRouter.get(
  '/maintenance.csv',
  asyncHandler(async (request, response) => {
    const filter: Record<string, unknown> = {};
    const status = String(request.query.status ?? '').trim();
    const assetId = String(request.query.assetId ?? '').trim();

    if (status) filter.status = status;
    if (assetId) filter.assetId = assetId;

    const records = await MaintenanceRecordModel.find(filter).sort({ nextMaintenanceDate: 1 }).exec();
    const csv = toCsv(
      ['id', 'assetId', 'lastInspectionDate', 'lastServiceDate', 'warrantyUntil', 'technician', 'nextMaintenanceDate', 'status', 'notes', 'createdAt'],
      records.map((record) => record.toJSON()),
    );

    sendCsv(response, 'maintenance.csv', csv);
  }),
);
