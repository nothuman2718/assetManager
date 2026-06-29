import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';

import { requireAuth, requireRoles } from '../../shared/middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { AssetModel } from './asset.model.js';

export const assetsRouter = Router();

const assetCreateSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(50),
  category: z.string().min(2),
  manufacturer: z.string().min(2),
  model: z.string().min(2),
  serialNumber: z.string().min(2),
  plantId: z.string().min(1).optional(),
  buildingId: z.string().min(1).optional(),
  departmentId: z.string().min(1).optional(),
  panelId: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive', 'maintenance', 'deleted']).optional(),
});

const assetUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).max(50).optional(),
  category: z.string().min(2).optional(),
  manufacturer: z.string().min(2).optional(),
  model: z.string().min(2).optional(),
  serialNumber: z.string().min(2).optional(),
  plantId: z.string().min(1).optional(),
  buildingId: z.string().min(1).optional(),
  departmentId: z.string().min(1).optional(),
  panelId: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive', 'maintenance', 'deleted']).optional(),
});

assetsRouter.use(requireAuth);

assetsRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const page = Number(request.query.page ?? 1);
    const limit = Number(request.query.limit ?? 20);
    const search = String(request.query.search ?? '').trim();
    const category = String(request.query.category ?? '').trim();
    const status = String(request.query.status ?? '').trim();
    const plantId = String(request.query.plantId ?? '').trim();

    const filter: Record<string, unknown> = { status: { $ne: 'deleted' } };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (status) {
      filter.status = status;
    }

    if (plantId && Types.ObjectId.isValid(plantId)) {
      filter.plantId = plantId;
    }

    const [items, total] = await Promise.all([
      AssetModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      AssetModel.countDocuments(filter),
    ]);

    response.status(200).json({
      data: items,
      pagination: { page, limit, total },
    });
  }),
);

assetsRouter.post(
  '/',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    const payload = assetCreateSchema.parse(request.body);
    const normalizedCode = payload.code.trim().toUpperCase();

    const existing = await AssetModel.findOne({ code: normalizedCode }).exec();
    if (existing) {
      response.status(409).json({ message: 'An asset with this code already exists' });
      return;
    }

    const asset = await AssetModel.create({
      name: payload.name.trim(),
      code: normalizedCode,
      category: payload.category.trim(),
      manufacturer: payload.manufacturer.trim(),
      model: payload.model.trim(),
      serialNumber: payload.serialNumber.trim(),
      plantId: payload.plantId?.trim() || null,
      buildingId: payload.buildingId?.trim() || null,
      departmentId: payload.departmentId?.trim() || null,
      panelId: payload.panelId?.trim() || null,
      status: payload.status ?? 'active',
    });

    response.status(201).json({ data: asset });
  }),
);

assetsRouter.get(
  '/:id',
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid asset id' });
      return;
    }

    const asset = await AssetModel.findOne({
      _id: request.params.id,
      status: { $ne: 'deleted' },
    }).exec();

    if (!asset) {
      response.status(404).json({ message: 'Asset not found' });
      return;
    }

    response.status(200).json({ data: asset });
  }),
);

assetsRouter.patch(
  '/:id',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid asset id' });
      return;
    }

    const payload = assetUpdateSchema.parse(request.body);
    const updates: Record<string, unknown> = {};

    if (payload.name) {
      updates.name = payload.name.trim();
    }

    if (payload.code) {
      updates.code = payload.code.trim().toUpperCase();
    }

    if (payload.category) {
      updates.category = payload.category.trim();
    }

    if (payload.manufacturer) {
      updates.manufacturer = payload.manufacturer.trim();
    }

    if (payload.model) {
      updates.model = payload.model.trim();
    }

    if (payload.serialNumber) {
      updates.serialNumber = payload.serialNumber.trim();
    }

    if (payload.plantId) {
      updates.plantId = payload.plantId.trim();
    }

    if (payload.buildingId) {
      updates.buildingId = payload.buildingId.trim();
    }

    if (payload.departmentId) {
      updates.departmentId = payload.departmentId.trim();
    }

    if (payload.panelId) {
      updates.panelId = payload.panelId.trim();
    }

    if (payload.status) {
      updates.status = payload.status;
    }

    const asset = await AssetModel.findOneAndUpdate(
      { _id: request.params.id, status: { $ne: 'deleted' } },
      { $set: updates },
      { new: true },
    ).exec();

    if (!asset) {
      response.status(404).json({ message: 'Asset not found' });
      return;
    }

    response.status(200).json({ data: asset });
  }),
);

assetsRouter.delete(
  '/:id',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid asset id' });
      return;
    }

    const asset = await AssetModel.findOneAndUpdate(
      { _id: request.params.id, status: { $ne: 'deleted' } },
      { $set: { status: 'deleted' } },
      { new: true },
    ).exec();

    if (!asset) {
      response.status(404).json({ message: 'Asset not found' });
      return;
    }

    response.status(200).json({ data: asset });
  }),
);
