import { Router } from 'express';

import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { AssetModel } from '../assets/asset.model.js';
import { DeviceModel } from '../assets/device.model.js';
import { BuildingModel } from '../hierarchy/building.model.js';
import { MaintenanceRecordModel } from '../maintenance/maintenance.model.js';
import { PlantModel } from '../hierarchy/plant.model.js';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const upcomingWindowEnd = () => {
  const end = startOfToday();
  end.setDate(end.getDate() + 30);
  return end;
};

const normalizeBuckets = <T extends string>(
  rows: Array<{ _id: T | null; count: number }>,
  buckets: T[],
) => {
  const counts = new Map(rows.map((row) => [row._id, row.count]));
  return buckets.map((bucket) => ({
    label: bucket,
    count: counts.get(bucket) ?? 0,
  }));
};

dashboardRouter.get(
  '/summary',
  asyncHandler(async (_request, response) => {
    const today = startOfToday();
    const windowEnd = upcomingWindowEnd();

    const [
      totalPlants,
      totalBuildings,
      totalAssets,
      totalDevices,
      onlineDevices,
      offlineDevices,
      upcomingMaintenance,
      overdueMaintenance,
    ] = await Promise.all([
      PlantModel.countDocuments({ status: { $ne: 'deleted' } }),
      BuildingModel.countDocuments({ status: { $ne: 'deleted' } }),
      AssetModel.countDocuments({ status: { $ne: 'deleted' } }),
      DeviceModel.countDocuments({}),
      DeviceModel.countDocuments({ status: 'online' }),
      DeviceModel.countDocuments({ status: 'offline' }),
      MaintenanceRecordModel.countDocuments({
        status: { $nin: ['completed', 'cancelled'] },
        nextMaintenanceDate: { $gte: today, $lte: windowEnd },
      }),
      MaintenanceRecordModel.countDocuments({
        status: { $nin: ['completed', 'cancelled'] },
        nextMaintenanceDate: { $lt: today },
      }),
    ]);

    response.status(200).json({
      data: {
        totalPlants,
        totalBuildings,
        totalAssets,
        totalDevices,
        onlineDevices,
        offlineDevices,
        maintenanceDue: upcomingMaintenance + overdueMaintenance,
        upcomingMaintenance,
        overdueMaintenance,
      },
    });
  }),
);

dashboardRouter.get(
  '/assets-by-category',
  asyncHandler(async (_request, response) => {
    const rows = await AssetModel.aggregate<{ _id: string; count: number }>([
      { $match: { status: { $ne: 'deleted' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]);

    response.status(200).json({
      data: rows.map((row) => ({ label: row._id ?? 'Uncategorized', count: row.count })),
    });
  }),
);

dashboardRouter.get(
  '/device-status',
  asyncHandler(async (_request, response) => {
    const rows = await DeviceModel.aggregate<{ _id: 'online' | 'offline' | 'maintenance' | 'disabled'; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    response.status(200).json({
      data: normalizeBuckets(rows, ['online', 'offline', 'maintenance', 'disabled']),
    });
  }),
);

dashboardRouter.get(
  '/maintenance',
  asyncHandler(async (_request, response) => {
    const today = startOfToday();
    const windowEnd = upcomingWindowEnd();

    const [statusRows, upcoming, overdue] = await Promise.all([
      MaintenanceRecordModel.aggregate<{ _id: 'scheduled' | 'completed' | 'overdue' | 'cancelled'; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      MaintenanceRecordModel.countDocuments({
        status: { $nin: ['completed', 'cancelled'] },
        nextMaintenanceDate: { $gte: today, $lte: windowEnd },
      }),
      MaintenanceRecordModel.countDocuments({
        status: { $nin: ['completed', 'cancelled'] },
        nextMaintenanceDate: { $lt: today },
      }),
    ]);

    response.status(200).json({
      data: {
        upcoming,
        overdue,
        byStatus: normalizeBuckets(statusRows, ['scheduled', 'completed', 'overdue', 'cancelled']),
      },
    });
  }),
);

dashboardRouter.get(
  '/recent-assets',
  asyncHandler(async (request, response) => {
    const limit = Number(request.query.limit ?? 5);
    const assets = await AssetModel.find({ status: { $ne: 'deleted' } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    response.status(200).json({ data: assets });
  }),
);
