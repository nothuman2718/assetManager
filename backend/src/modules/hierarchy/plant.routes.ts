import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';

import { requireAuth, requireRoles } from '../../shared/middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { PlantModel } from './plant.model.js';

export const plantsRouter = Router();

const plantCreateSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(50),
  status: z.enum(['active', 'inactive', 'deleted']).optional(),
});

const plantUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).max(50).optional(),
  status: z.enum(['active', 'inactive', 'deleted']).optional(),
});

plantsRouter.use(requireAuth);

plantsRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const page = Number(request.query.page ?? 1);
    const limit = Number(request.query.limit ?? 20);
    const search = String(request.query.search ?? '').trim();

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      PlantModel.find({ ...filter, status: { $ne: 'deleted' } })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      PlantModel.countDocuments({ ...filter, status: { $ne: 'deleted' } }),
    ]);

    response.status(200).json({
      data: items,
      pagination: { page, limit, total },
    });
  }),
);

plantsRouter.post(
  '/',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    const payload = plantCreateSchema.parse(request.body);
    const normalizedCode = payload.code.trim().toUpperCase();

    const existing = await PlantModel.findOne({ code: normalizedCode }).exec();
    if (existing) {
      response.status(409).json({ message: 'A plant with this code already exists' });
      return;
    }

    const plant = await PlantModel.create({
      name: payload.name.trim(),
      code: normalizedCode,
      status: payload.status ?? 'active',
    });

    response.status(201).json({ data: plant });
  }),
);

plantsRouter.get(
  '/:id',
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid plant id' });
      return;
    }

    const plant = await PlantModel.findOne({
      _id: request.params.id,
      status: { $ne: 'deleted' },
    }).exec();

    if (!plant) {
      response.status(404).json({ message: 'Plant not found' });
      return;
    }

    response.status(200).json({ data: plant });
  }),
);

plantsRouter.patch(
  '/:id',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid plant id' });
      return;
    }

    const payload = plantUpdateSchema.parse(request.body);
    const updates: Record<string, unknown> = {};

    if (payload.name) {
      updates.name = payload.name.trim();
    }

    if (payload.code) {
      updates.code = payload.code.trim().toUpperCase();
    }

    if (payload.status) {
      updates.status = payload.status;
    }

    const plant = await PlantModel.findOneAndUpdate(
      { _id: request.params.id, status: { $ne: 'deleted' } },
      { $set: updates },
      { new: true },
    ).exec();

    if (!plant) {
      response.status(404).json({ message: 'Plant not found' });
      return;
    }

    response.status(200).json({ data: plant });
  }),
);

plantsRouter.delete(
  '/:id',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid plant id' });
      return;
    }

    const plant = await PlantModel.findOneAndUpdate(
      { _id: request.params.id, status: { $ne: 'deleted' } },
      { $set: { status: 'deleted' } },
      { new: true },
    ).exec();

    if (!plant) {
      response.status(404).json({ message: 'Plant not found' });
      return;
    }

    response.status(200).json({ data: plant });
  }),
);
