import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';

import { requireAuth, requireRoles } from '../../shared/middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { BuildingModel } from './building.model.js';
import { PlantModel } from './plant.model.js';

export const buildingsRouter = Router();

const buildingCreateSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(50),
  plantId: z.string().min(1),
  status: z.enum(['active', 'inactive', 'deleted']).optional(),
});

const buildingUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).max(50).optional(),
  plantId: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive', 'deleted']).optional(),
});

buildingsRouter.use(requireAuth);

buildingsRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const page = Number(request.query.page ?? 1);
    const limit = Number(request.query.limit ?? 20);
    const search = String(request.query.search ?? '').trim();
    const plantId = String(request.query.plantId ?? '').trim();

    const filter: Record<string, unknown> = { status: { $ne: 'deleted' } };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    if (plantId && Types.ObjectId.isValid(plantId)) {
      filter.plantId = plantId;
    }

    const [items, total] = await Promise.all([
      BuildingModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      BuildingModel.countDocuments(filter),
    ]);

    response.status(200).json({
      data: items,
      pagination: { page, limit, total },
    });
  }),
);

buildingsRouter.post(
  '/',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    const payload = buildingCreateSchema.parse(request.body);
    if (!Types.ObjectId.isValid(payload.plantId)) {
      response.status(400).json({ message: 'Invalid plant id' });
      return;
    }

    const plant = await PlantModel.findOne({ _id: payload.plantId, status: { $ne: 'deleted' } }).exec();
    if (!plant) {
      response.status(404).json({ message: 'Plant not found' });
      return;
    }

    const existing = await BuildingModel.findOne({
      plantId: payload.plantId,
      code: payload.code.trim().toUpperCase(),
    }).exec();
    if (existing) {
      response.status(409).json({ message: 'A building with this code already exists for the selected plant' });
      return;
    }

    const building = await BuildingModel.create({
      name: payload.name.trim(),
      code: payload.code.trim().toUpperCase(),
      plantId: payload.plantId,
      status: payload.status ?? 'active',
    });

    response.status(201).json({ data: building });
  }),
);

buildingsRouter.get(
  '/:id',
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid building id' });
      return;
    }

    const building = await BuildingModel.findOne({
      _id: request.params.id,
      status: { $ne: 'deleted' },
    }).exec();

    if (!building) {
      response.status(404).json({ message: 'Building not found' });
      return;
    }

    response.status(200).json({ data: building });
  }),
);

buildingsRouter.patch(
  '/:id',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid building id' });
      return;
    }

    const payload = buildingUpdateSchema.parse(request.body);
    const updates: Record<string, unknown> = {};

    if (payload.name) {
      updates.name = payload.name.trim();
    }

    if (payload.code) {
      updates.code = payload.code.trim().toUpperCase();
    }

    if (payload.plantId) {
      if (!Types.ObjectId.isValid(payload.plantId)) {
        response.status(400).json({ message: 'Invalid plant id' });
        return;
      }

      const plant = await PlantModel.findOne({ _id: payload.plantId, status: { $ne: 'deleted' } }).exec();
      if (!plant) {
        response.status(404).json({ message: 'Plant not found' });
        return;
      }

      updates.plantId = payload.plantId;
    }

    if (payload.status) {
      updates.status = payload.status;
    }

    const building = await BuildingModel.findOneAndUpdate(
      { _id: request.params.id, status: { $ne: 'deleted' } },
      { $set: updates },
      { new: true },
    ).exec();

    if (!building) {
      response.status(404).json({ message: 'Building not found' });
      return;
    }

    response.status(200).json({ data: building });
  }),
);

buildingsRouter.delete(
  '/:id',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid building id' });
      return;
    }

    const building = await BuildingModel.findOneAndUpdate(
      { _id: request.params.id, status: { $ne: 'deleted' } },
      { $set: { status: 'deleted' } },
      { new: true },
    ).exec();

    if (!building) {
      response.status(404).json({ message: 'Building not found' });
      return;
    }

    response.status(200).json({ data: building });
  }),
);
