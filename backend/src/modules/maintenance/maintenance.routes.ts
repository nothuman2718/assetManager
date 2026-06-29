import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';

import { requireAuth, requireRoles } from '../../shared/middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { AssetModel } from '../assets/asset.model.js';
import type { MaintenanceStatus } from './maintenance.model.js';
import { MaintenanceRecordModel } from './maintenance.model.js';

export const maintenanceRouter = Router();

const optionalDateSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? new Date(value) : null))
  .refine((value) => value === null || !Number.isNaN(value.getTime()), 'Invalid date');

const requiredDateSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value) => new Date(value))
  .refine((value) => !Number.isNaN(value.getTime()), 'Invalid date');

const maintenanceCreateSchema = z.object({
  assetId: z.string().min(1),
  lastInspectionDate: optionalDateSchema,
  lastServiceDate: optionalDateSchema,
  warrantyUntil: optionalDateSchema,
  technician: z.string().min(2),
  nextMaintenanceDate: requiredDateSchema,
  status: z.enum(['scheduled', 'completed', 'overdue', 'cancelled']).optional(),
  notes: z.string().optional(),
});

const maintenanceUpdateSchema = maintenanceCreateSchema.partial();

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const normalizeMaintenanceStatus = (status: string | undefined, nextMaintenanceDate: Date) => {
  if (status === 'completed' || status === 'cancelled') {
    return status;
  }

  return nextMaintenanceDate < startOfToday() ? 'overdue' : status ?? 'scheduled';
};

const buildMaintenanceFilter = async (query: Record<string, unknown>) => {
  const assetId = String(query.assetId ?? '').trim();
  const plantId = String(query.plantId ?? '').trim();
  const buildingId = String(query.buildingId ?? '').trim();
  const departmentId = String(query.departmentId ?? '').trim();
  const panelId = String(query.panelId ?? '').trim();
  const status = String(query.status ?? '').trim();
  const from = String(query.from ?? '').trim();
  const to = String(query.to ?? '').trim();

  const filter: Record<string, unknown> = {};

  if (assetId && Types.ObjectId.isValid(assetId)) {
    filter.assetId = assetId;
  }

  if (!assetId && (plantId || buildingId || departmentId || panelId)) {
    const assetFilter: Record<string, unknown> = { status: { $ne: 'deleted' } };

    if (plantId && Types.ObjectId.isValid(plantId)) assetFilter.plantId = plantId;
    if (buildingId && Types.ObjectId.isValid(buildingId)) assetFilter.buildingId = buildingId;
    if (departmentId && Types.ObjectId.isValid(departmentId)) assetFilter.departmentId = departmentId;
    if (panelId && Types.ObjectId.isValid(panelId)) assetFilter.panelId = panelId;

    const assets = await AssetModel.find(assetFilter).select('_id').exec();
    filter.assetId = { $in: assets.map((asset) => asset._id) };
  }

  if (status === 'upcoming') {
    filter.status = { $nin: ['completed', 'cancelled'] };
    filter.nextMaintenanceDate = { $gte: startOfToday() };
  } else if (status === 'overdue') {
    filter.status = { $nin: ['completed', 'cancelled'] };
    filter.nextMaintenanceDate = { $lt: startOfToday() };
  } else if (status) {
    filter.status = status;
  }

  if (from || to) {
    const dateFilter = typeof filter.nextMaintenanceDate === 'object' && filter.nextMaintenanceDate !== null
      ? { ...(filter.nextMaintenanceDate as Record<string, Date>) }
      : {};

    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);
    filter.nextMaintenanceDate = dateFilter;
  }

  return filter;
};

maintenanceRouter.use(requireAuth);

maintenanceRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const page = Number(request.query.page ?? 1);
    const limit = Number(request.query.limit ?? 50);
    const filter = await buildMaintenanceFilter(request.query);

    const [items, total] = await Promise.all([
      MaintenanceRecordModel.find(filter)
        .sort({ nextMaintenanceDate: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      MaintenanceRecordModel.countDocuments(filter),
    ]);

    response.status(200).json({
      data: items,
      pagination: { page, limit, total },
    });
  }),
);

maintenanceRouter.get(
  '/upcoming',
  asyncHandler(async (request, response) => {
    const days = Number(request.query.days ?? 30);
    const today = startOfToday();
    const until = new Date(today);
    until.setDate(until.getDate() + days);

    const items = await MaintenanceRecordModel.find({
      status: { $nin: ['completed', 'cancelled'] },
      nextMaintenanceDate: { $gte: today, $lte: until },
    })
      .sort({ nextMaintenanceDate: 1 })
      .exec();

    response.status(200).json({ data: items });
  }),
);

maintenanceRouter.get(
  '/overdue',
  asyncHandler(async (_request, response) => {
    const items = await MaintenanceRecordModel.find({
      status: { $nin: ['completed', 'cancelled'] },
      nextMaintenanceDate: { $lt: startOfToday() },
    })
      .sort({ nextMaintenanceDate: 1 })
      .exec();

    response.status(200).json({ data: items });
  }),
);

maintenanceRouter.post(
  '/',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    const payload = maintenanceCreateSchema.parse(request.body);

    if (!Types.ObjectId.isValid(payload.assetId)) {
      response.status(400).json({ message: 'Invalid asset id' });
      return;
    }

    const asset = await AssetModel.findOne({ _id: payload.assetId, status: { $ne: 'deleted' } }).exec();
    if (!asset) {
      response.status(404).json({ message: 'Asset not found' });
      return;
    }

    const record = await MaintenanceRecordModel.create({
      assetId: payload.assetId,
      lastInspectionDate: payload.lastInspectionDate,
      lastServiceDate: payload.lastServiceDate,
      warrantyUntil: payload.warrantyUntil,
      technician: payload.technician.trim(),
      nextMaintenanceDate: payload.nextMaintenanceDate,
      status: normalizeMaintenanceStatus(payload.status, payload.nextMaintenanceDate) as MaintenanceStatus,
      notes: payload.notes?.trim() || null,
    });

    response.status(201).json({ data: record });
  }),
);

maintenanceRouter.get(
  '/:id',
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(String(request.params.id))) {
      response.status(400).json({ message: 'Invalid maintenance id' });
      return;
    }

    const record = await MaintenanceRecordModel.findById(String(request.params.id)).exec();
    if (!record) {
      response.status(404).json({ message: 'Maintenance record not found' });
      return;
    }

    response.status(200).json({ data: record });
  }),
);

maintenanceRouter.patch(
  '/:id',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(String(request.params.id))) {
      response.status(400).json({ message: 'Invalid maintenance id' });
      return;
    }

    const payload = maintenanceUpdateSchema.parse(request.body);
    const updates: Record<string, unknown> = {};

    if (payload.assetId) {
      if (!Types.ObjectId.isValid(payload.assetId)) {
        response.status(400).json({ message: 'Invalid asset id' });
        return;
      }
      updates.assetId = payload.assetId;
    }
    if (payload.lastInspectionDate !== undefined) updates.lastInspectionDate = payload.lastInspectionDate;
    if (payload.lastServiceDate !== undefined) updates.lastServiceDate = payload.lastServiceDate;
    if (payload.warrantyUntil !== undefined) updates.warrantyUntil = payload.warrantyUntil;
    if (payload.technician) updates.technician = payload.technician.trim();
    if (payload.nextMaintenanceDate) updates.nextMaintenanceDate = payload.nextMaintenanceDate;
    if (payload.notes !== undefined) updates.notes = payload.notes?.trim() || null;
    if (payload.status || payload.nextMaintenanceDate) {
      updates.status = normalizeMaintenanceStatus(payload.status, payload.nextMaintenanceDate ?? new Date());
    }

    const record = await MaintenanceRecordModel.findByIdAndUpdate(
      String(request.params.id),
      { $set: updates },
      { new: true },
    ).exec();

    if (!record) {
      response.status(404).json({ message: 'Maintenance record not found' });
      return;
    }

    response.status(200).json({ data: record });
  }),
);

maintenanceRouter.delete(
  '/:id',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(String(request.params.id))) {
      response.status(400).json({ message: 'Invalid maintenance id' });
      return;
    }

    const record = await MaintenanceRecordModel.findByIdAndUpdate(
      String(request.params.id),
      { $set: { status: 'cancelled' } },
      { new: true },
    ).exec();

    if (!record) {
      response.status(404).json({ message: 'Maintenance record not found' });
      return;
    }

    response.status(200).json({ data: record });
  }),
);
