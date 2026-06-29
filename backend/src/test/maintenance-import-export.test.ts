import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../app.js';
import { AssetModel } from '../modules/assets/asset.model.js';
import { DeviceModel } from '../modules/assets/device.model.js';
import { hashPassword } from '../modules/auth/password.service.js';
import { signAuthToken } from '../modules/auth/token.service.js';
import { BuildingModel } from '../modules/hierarchy/building.model.js';
import { DepartmentModel } from '../modules/hierarchy/department.model.js';
import { PanelModel } from '../modules/hierarchy/panel.model.js';
import { PlantModel } from '../modules/hierarchy/plant.model.js';
import { MaintenanceRecordModel } from '../modules/maintenance/maintenance.model.js';
import { UserModel } from '../modules/users/user.model.js';
import { connectDatabase, disconnectDatabase } from '../shared/database/mongodb.js';

describe('maintenance, import, and export routes', () => {
  const app = createApp();
  const testEmail = 'phase5.phase6@example.com';
  let authToken = '';

  beforeAll(async () => {
    await connectDatabase();

    await Promise.all([
      MaintenanceRecordModel.deleteMany({ technician: /^Phase 5/ }),
      DeviceModel.deleteMany({ name: /^Phase 6/ }),
      AssetModel.deleteMany({ code: { $in: ['P5-ASSET-A', 'P5-ASSET-B', 'P5-ASSET-C', 'P6-EXPORT-ASSET', 'CSV-ASSET'] } }),
      PanelModel.deleteMany({ code: /^P56/ }),
      DepartmentModel.deleteMany({ code: /^P56/ }),
      BuildingModel.deleteMany({ code: /^P56/ }),
      PlantModel.deleteMany({ code: /^P56/ }),
      UserModel.deleteMany({ email: testEmail }),
    ]);

    const user = await UserModel.create({
      name: 'Maintenance Tester',
      email: testEmail,
      passwordHash: await hashPassword('Password123!'),
      role: 'Admin',
      status: 'active',
    });
    authToken = signAuthToken({ sub: user.id, role: 'Admin' });
  });

  afterAll(async () => {
    await Promise.all([
      MaintenanceRecordModel.deleteMany({ technician: /^Phase 5/ }),
      DeviceModel.deleteMany({ name: /^Phase 6/ }),
      AssetModel.deleteMany({ code: { $in: ['P5-ASSET-A', 'P5-ASSET-B', 'P5-ASSET-C', 'P6-EXPORT-ASSET', 'CSV-ASSET'] } }),
      PanelModel.deleteMany({ code: /^P56/ }),
      DepartmentModel.deleteMany({ code: /^P56/ }),
      BuildingModel.deleteMany({ code: /^P56/ }),
      PlantModel.deleteMany({ code: /^P56/ }),
      UserModel.deleteMany({ email: testEmail }),
    ]);
    await disconnectDatabase();
  });

  const createPlantAsset = async (code: string) => {
    const plant = await PlantModel.create({ name: `Phase Plant ${code}`, code: `P56-${code}` });
    const asset = await AssetModel.create({
      name: `Phase Asset ${code}`,
      code,
      category: 'Meter',
      manufacturer: 'Acme',
      model: 'M100',
      serialNumber: `${code}-SN`,
      plantId: plant.id,
      status: 'active',
    });

    return { assetId: asset.id, plantId: plant.id };
  };

  it('creates, lists, updates, and reports upcoming and overdue maintenance', async () => {
    const upcomingAsset = await createPlantAsset('P5-ASSET-A');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const upcomingResponse = await request(app)
      .post('/api/maintenance')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        assetId: upcomingAsset.assetId,
        technician: 'Phase 5 Ravi Kumar',
        nextMaintenanceDate: tomorrow.toISOString(),
        notes: 'Inspect meter connections',
      })
      .expect(201);

    const overdueAsset = await createPlantAsset('P5-ASSET-C');
    await request(app)
      .post('/api/maintenance')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        assetId: overdueAsset.assetId,
        technician: 'Phase 5 Ravi Kumar',
        nextMaintenanceDate: yesterday.toISOString(),
      })
      .expect(201);

    const listResponse = await request(app)
      .get('/api/maintenance')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ assetId: upcomingAsset.assetId })
      .expect(200);

    expect(listResponse.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ assetId: upcomingAsset.assetId })]),
    );

    const hierarchyFilterResponse = await request(app)
      .get('/api/maintenance')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ plantId: upcomingAsset.plantId })
      .expect(200);
    expect(hierarchyFilterResponse.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ assetId: upcomingAsset.assetId })]),
    );

    const overdueResponse = await request(app)
      .get('/api/maintenance/overdue')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(overdueResponse.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: 'overdue' })]),
    );

    const nextWeekResponse = await request(app)
      .get('/api/maintenance/upcoming')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ days: 7 })
      .expect(200);
    expect(nextWeekResponse.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: upcomingResponse.body.data.id })]),
    );

    await request(app)
      .patch(`/api/maintenance/${upcomingResponse.body.data.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'completed' })
      .expect(200);
  });

  it('imports asset and device CSV rows with row-level results', async () => {
    const { plantId } = await createPlantAsset('P5-ASSET-B');
    const assetCsv = [
      'name,code,category,manufacturer,model,serialNumber,plantId,status',
      `CSV Meter,CSV-ASSET,Meter,Acme,CSV-1,CSV-SN,${plantId},active`,
      'Bad Meter,BAD-ASSET,Meter,Acme,CSV-1,BAD-SN,507f1f77bcf86cd799439011,active',
    ].join('\n');

    const assetImportResponse = await request(app)
      .post('/api/imports/assets')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Content-Type', 'text/csv')
      .send(assetCsv)
      .expect(200);

    expect(assetImportResponse.body.data).toMatchObject({
      totalRows: 2,
      successCount: 1,
      errorCount: 1,
    });

    const importedAsset = await AssetModel.findOne({ code: 'CSV-ASSET' }).exec();
    expect(importedAsset).toBeTruthy();

    const deviceCsv = [
      'assetId,name,ipAddress,protocol,port,modbusAddress,communicationType,pollingInterval,status',
      `${importedAsset!.id},Phase 6 CSV Device,192.168.1.20,ModbusTCP,502,1,Ethernet,30,online`,
    ].join('\n');

    const deviceImportResponse = await request(app)
      .post('/api/imports/devices')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Content-Type', 'text/csv')
      .send(deviceCsv)
      .expect(200);

    expect(deviceImportResponse.body.data).toMatchObject({
      totalRows: 1,
      successCount: 1,
      errorCount: 0,
    });
  });

  it('exports assets, devices, and maintenance as CSV', async () => {
    const { assetId } = await createPlantAsset('P6-EXPORT-ASSET');
    await MaintenanceRecordModel.create({
      assetId,
      technician: 'Phase 5 Export Technician',
      nextMaintenanceDate: new Date(),
      status: 'scheduled',
    });

    const assetsCsvResponse = await request(app)
      .get('/api/exports/assets.csv')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(assetsCsvResponse.text).toContain('id,name,code');
    const devicesCsvResponse = await request(app)
      .get('/api/exports/devices.csv')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(devicesCsvResponse.text).toContain('id,assetId,name');

    const maintenanceCsvResponse = await request(app)
      .get('/api/exports/maintenance.csv')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(maintenanceCsvResponse.text).toContain('id,assetId,lastInspectionDate');
  });
});
