import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';

import { requireAuth, requireRoles } from '../../shared/middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { DepartmentModel } from './department.model.js';
import { PanelModel } from './panel.model.js';

export const panelsRouter = Router();

const panelCreateSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(50),
  departmentId: z.string().min(1),
  status: z.enum(['active', 'inactive', 'deleted']).optional(),
});

const panelUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).max(50).optional(),
  departmentId: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive', 'deleted']).optional(),
});

panelsRouter.use(requireAuth);

panelsRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const page = Number(request.query.page ?? 1);
    const limit = Number(request.query.limit ?? 20);
    const search = String(request.query.search ?? '').trim();
    const departmentId = String(request.query.departmentId ?? '').trim();

    const filter: Record<string, unknown> = { status: { $ne: 'deleted' } };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    if (departmentId && Types.ObjectId.isValid(departmentId)) {
      filter.departmentId = departmentId;
    }

    const [items, total] = await Promise.all([
      PanelModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      PanelModel.countDocuments(filter),
    ]);

    response.status(200).json({
      data: items,
      pagination: { page, limit, total },
    });
  }),
);

panelsRouter.post(
  '/',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    const payload = panelCreateSchema.parse(request.body);
    if (!Types.ObjectId.isValid(payload.departmentId)) {
      response.status(400).json({ message: 'Invalid department id' });
      return;
    }

    const department = await DepartmentModel.findOne({ _id: payload.departmentId, status: { $ne: 'deleted' } }).exec();
    if (!department) {
      response.status(404).json({ message: 'Department not found' });
      return;
    }

    const existing = await PanelModel.findOne({
      departmentId: payload.departmentId,
      code: payload.code.trim().toUpperCase(),
    }).exec();
    if (existing) {
      response.status(409).json({ message: 'A panel with this code already exists for the selected department' });
      return;
    }

    const panel = await PanelModel.create({
      name: payload.name.trim(),
      code: payload.code.trim().toUpperCase(),
      departmentId: payload.departmentId,
      status: payload.status ?? 'active',
    });

    response.status(201).json({ data: panel });
  }),
);

panelsRouter.get(
  '/:id',
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(String(request.params.id))) {
      response.status(400).json({ message: 'Invalid panel id' });
      return;
    }

    const panel = await PanelModel.findOne({
      _id: String(request.params.id),
      status: { $ne: 'deleted' },
    }).exec();

    if (!panel) {
      response.status(404).json({ message: 'Panel not found' });
      return;
    }

    response.status(200).json({ data: panel });
  }),
);

panelsRouter.patch(
  '/:id',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(String(request.params.id))) {
      response.status(400).json({ message: 'Invalid panel id' });
      return;
    }

    const payload = panelUpdateSchema.parse(request.body);
    const updates: Record<string, unknown> = {};

    if (payload.name) {
      updates.name = payload.name.trim();
    }

    if (payload.code) {
      updates.code = payload.code.trim().toUpperCase();
    }

    if (payload.departmentId) {
      if (!Types.ObjectId.isValid(payload.departmentId)) {
        response.status(400).json({ message: 'Invalid department id' });
        return;
      }

      const department = await DepartmentModel.findOne({ _id: payload.departmentId, status: { $ne: 'deleted' } }).exec();
      if (!department) {
        response.status(404).json({ message: 'Department not found' });
        return;
      }

      updates.departmentId = payload.departmentId;
    }

    if (payload.status) {
      updates.status = payload.status;
    }

    const panel = await PanelModel.findOneAndUpdate(
      { _id: String(request.params.id), status: { $ne: 'deleted' } },
      { $set: updates },
      { new: true },
    ).exec();

    if (!panel) {
      response.status(404).json({ message: 'Panel not found' });
      return;
    }

    response.status(200).json({ data: panel });
  }),
);

panelsRouter.delete(
  '/:id',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(String(request.params.id))) {
      response.status(400).json({ message: 'Invalid panel id' });
      return;
    }

    const panel = await PanelModel.findOneAndUpdate(
      { _id: String(request.params.id), status: { $ne: 'deleted' } },
      { $set: { status: 'deleted' } },
      { new: true },
    ).exec();

    if (!panel) {
      response.status(404).json({ message: 'Panel not found' });
      return;
    }

    response.status(200).json({ data: panel });
  }),
);
