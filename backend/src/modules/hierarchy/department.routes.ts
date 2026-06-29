import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';

import { requireAuth, requireRoles } from '../../shared/middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { BuildingModel } from './building.model.js';
import { DepartmentModel } from './department.model.js';

export const departmentsRouter = Router();

const departmentCreateSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(50),
  buildingId: z.string().min(1),
  status: z.enum(['active', 'inactive', 'deleted']).optional(),
});

const departmentUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).max(50).optional(),
  buildingId: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive', 'deleted']).optional(),
});

departmentsRouter.use(requireAuth);

departmentsRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const page = Number(request.query.page ?? 1);
    const limit = Number(request.query.limit ?? 20);
    const search = String(request.query.search ?? '').trim();
    const buildingId = String(request.query.buildingId ?? '').trim();

    const filter: Record<string, unknown> = { status: { $ne: 'deleted' } };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    if (buildingId && Types.ObjectId.isValid(buildingId)) {
      filter.buildingId = buildingId;
    }

    const [items, total] = await Promise.all([
      DepartmentModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      DepartmentModel.countDocuments(filter),
    ]);

    response.status(200).json({
      data: items,
      pagination: { page, limit, total },
    });
  }),
);

departmentsRouter.post(
  '/',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    const payload = departmentCreateSchema.parse(request.body);
    if (!Types.ObjectId.isValid(payload.buildingId)) {
      response.status(400).json({ message: 'Invalid building id' });
      return;
    }

    const building = await BuildingModel.findOne({ _id: payload.buildingId, status: { $ne: 'deleted' } }).exec();
    if (!building) {
      response.status(404).json({ message: 'Building not found' });
      return;
    }

    const existing = await DepartmentModel.findOne({
      buildingId: payload.buildingId,
      code: payload.code.trim().toUpperCase(),
    }).exec();
    if (existing) {
      response.status(409).json({ message: 'A department with this code already exists for the selected building' });
      return;
    }

    const department = await DepartmentModel.create({
      name: payload.name.trim(),
      code: payload.code.trim().toUpperCase(),
      buildingId: payload.buildingId,
      status: payload.status ?? 'active',
    });

    response.status(201).json({ data: department });
  }),
);

departmentsRouter.get(
  '/:id',
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid department id' });
      return;
    }

    const department = await DepartmentModel.findOne({
      _id: request.params.id,
      status: { $ne: 'deleted' },
    }).exec();

    if (!department) {
      response.status(404).json({ message: 'Department not found' });
      return;
    }

    response.status(200).json({ data: department });
  }),
);

departmentsRouter.patch(
  '/:id',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid department id' });
      return;
    }

    const payload = departmentUpdateSchema.parse(request.body);
    const updates: Record<string, unknown> = {};

    if (payload.name) {
      updates.name = payload.name.trim();
    }

    if (payload.code) {
      updates.code = payload.code.trim().toUpperCase();
    }

    if (payload.buildingId) {
      if (!Types.ObjectId.isValid(payload.buildingId)) {
        response.status(400).json({ message: 'Invalid building id' });
        return;
      }

      const building = await BuildingModel.findOne({ _id: payload.buildingId, status: { $ne: 'deleted' } }).exec();
      if (!building) {
        response.status(404).json({ message: 'Building not found' });
        return;
      }

      updates.buildingId = payload.buildingId;
    }

    if (payload.status) {
      updates.status = payload.status;
    }

    const department = await DepartmentModel.findOneAndUpdate(
      { _id: request.params.id, status: { $ne: 'deleted' } },
      { $set: updates },
      { new: true },
    ).exec();

    if (!department) {
      response.status(404).json({ message: 'Department not found' });
      return;
    }

    response.status(200).json({ data: department });
  }),
);

departmentsRouter.delete(
  '/:id',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid department id' });
      return;
    }

    const department = await DepartmentModel.findOneAndUpdate(
      { _id: request.params.id, status: { $ne: 'deleted' } },
      { $set: { status: 'deleted' } },
      { new: true },
    ).exec();

    if (!department) {
      response.status(404).json({ message: 'Department not found' });
      return;
    }

    response.status(200).json({ data: department });
  }),
);
