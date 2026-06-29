import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';

import { requireAuth, requireRoles } from '../../shared/middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { DeviceModel } from './device.model.js';

export const devicesRouter = Router();

const deviceCreateSchema = z.object({
  assetId: z.string().min(1),
  name: z.string().min(2),
  ipAddress: z.string().min(7).optional(),
  protocol: z.enum(['ModbusTCP', 'ModbusRTU', 'EthernetIP', 'OPC-UA']),
  port: z.number().int().min(1).max(65535),
  modbusAddress: z.number().int().min(1).max(247).optional(),
  communicationType: z.string().min(2),
  pollingInterval: z.number().int().min(5).max(3600),
  status: z.enum(['online', 'offline', 'maintenance', 'disabled']).optional(),
});

const deviceUpdateSchema = z.object({
  assetId: z.string().min(1).optional(),
  name: z.string().min(2).optional(),
  ipAddress: z.string().min(7).optional(),
  protocol: z.enum(['ModbusTCP', 'ModbusRTU', 'EthernetIP', 'OPC-UA']).optional(),
  port: z.number().int().min(1).max(65535).optional(),
  modbusAddress: z.number().int().min(1).max(247).optional(),
  communicationType: z.string().min(2).optional(),
  pollingInterval: z.number().int().min(5).max(3600).optional(),
  status: z.enum(['online', 'offline', 'maintenance', 'disabled']).optional(),
});

devicesRouter.use(requireAuth);

devicesRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const page = Number(request.query.page ?? 1);
    const limit = Number(request.query.limit ?? 20);
    const search = String(request.query.search ?? '').trim();
    const status = String(request.query.status ?? '').trim();
    const protocol = String(request.query.protocol ?? '').trim();
    const assetId = String(request.query.assetId ?? '').trim();

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { communicationType: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (protocol) {
      filter.protocol = protocol;
    }

    if (assetId && Types.ObjectId.isValid(assetId)) {
      filter.assetId = assetId;
    }

    const [items, total] = await Promise.all([
      DeviceModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      DeviceModel.countDocuments(filter),
    ]);

    response.status(200).json({
      data: items,
      pagination: { page, limit, total },
    });
  }),
);

devicesRouter.post(
  '/',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    const payload = deviceCreateSchema.parse(request.body);

    if (!Types.ObjectId.isValid(payload.assetId)) {
      response.status(400).json({ message: 'Invalid asset id' });
      return;
    }

    const device = await DeviceModel.create({
      assetId: payload.assetId,
      name: payload.name.trim(),
      ipAddress: payload.ipAddress?.trim(),
      protocol: payload.protocol,
      port: payload.port,
      modbusAddress: payload.modbusAddress,
      communicationType: payload.communicationType.trim(),
      pollingInterval: payload.pollingInterval,
      status: payload.status ?? 'online',
    });

    response.status(201).json({ data: device });
  }),
);

devicesRouter.get(
  '/:id',
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid device id' });
      return;
    }

    const device = await DeviceModel.findById(request.params.id).exec();

    if (!device) {
      response.status(404).json({ message: 'Device not found' });
      return;
    }

    response.status(200).json({ data: device });
  }),
);

devicesRouter.patch(
  '/:id',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid device id' });
      return;
    }

    const payload = deviceUpdateSchema.parse(request.body);
    const updates: Record<string, unknown> = {};

    if (payload.assetId) {
      if (!Types.ObjectId.isValid(payload.assetId)) {
        response.status(400).json({ message: 'Invalid asset id' });
        return;
      }
      updates.assetId = payload.assetId;
    }

    if (payload.name) {
      updates.name = payload.name.trim();
    }

    if (payload.ipAddress) {
      updates.ipAddress = payload.ipAddress.trim();
    }

    if (payload.protocol) {
      updates.protocol = payload.protocol;
    }

    if (payload.port) {
      updates.port = payload.port;
    }

    if (payload.modbusAddress) {
      updates.modbusAddress = payload.modbusAddress;
    }

    if (payload.communicationType) {
      updates.communicationType = payload.communicationType.trim();
    }

    if (payload.pollingInterval) {
      updates.pollingInterval = payload.pollingInterval;
    }

    if (payload.status) {
      updates.status = payload.status;
    }

    const device = await DeviceModel.findByIdAndUpdate(request.params.id, { $set: updates }, { new: true }).exec();

    if (!device) {
      response.status(404).json({ message: 'Device not found' });
      return;
    }

    response.status(200).json({ data: device });
  }),
);

devicesRouter.post(
  '/:id/simulate-status',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid device id' });
      return;
    }

    const nextStatuses: Array<'online' | 'offline' | 'maintenance' | 'disabled'> = ['online', 'offline', 'maintenance', 'disabled'];
    const device = await DeviceModel.findById(request.params.id).exec();

    if (!device) {
      response.status(404).json({ message: 'Device not found' });
      return;
    }

    const currentIndex = nextStatuses.indexOf(device.status);
    const nextStatus = nextStatuses[(currentIndex + 1) % nextStatuses.length];

    const updatedDevice = await DeviceModel.findByIdAndUpdate(
      request.params.id,
      { $set: { status: nextStatus } },
      { new: true },
    ).exec();

    response.status(200).json({ data: updatedDevice });
  }),
);

devicesRouter.delete(
  '/:id',
  requireRoles('Admin', 'Engineer'),
  asyncHandler(async (request, response) => {
    if (!Types.ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid device id' });
      return;
    }

    const device = await DeviceModel.findByIdAndDelete(request.params.id).exec();

    if (!device) {
      response.status(404).json({ message: 'Device not found' });
      return;
    }

    response.status(200).json({ data: device });
  }),
);
