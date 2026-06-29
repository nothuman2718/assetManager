import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../app.js';
import { hashPassword } from '../modules/auth/password.service.js';
import { AssetModel } from '../modules/assets/asset.model.js';
import { DeviceModel } from '../modules/assets/device.model.js';
import { signAuthToken } from '../modules/auth/token.service.js';
import { UserModel } from '../modules/users/user.model.js';
import { connectDatabase, disconnectDatabase } from '../shared/database/mongodb.js';

describe('asset and device routes', () => {
  const app = createApp();
  const testEmail = 'phase4.assets@example.com';
  const testPassword = 'Password123!';
  let authToken = '';

  beforeAll(async () => {
    await connectDatabase();

    await Promise.all([
      AssetModel.deleteMany({}),
      DeviceModel.deleteMany({}),
      UserModel.deleteMany({ email: testEmail }),
    ]);

    const user = await UserModel.create({
      name: 'Asset Tester',
      email: testEmail,
      passwordHash: await hashPassword(testPassword),
      role: 'Admin',
      status: 'active',
    });

    authToken = signAuthToken({ sub: user.id, role: 'Admin' });
  });

  afterAll(async () => {
    await Promise.all([
      AssetModel.deleteMany({}),
      DeviceModel.deleteMany({}),
      UserModel.deleteMany({ email: testEmail }),
    ]);
    await disconnectDatabase();
  });

  it('creates an asset and a linked device configuration through the API', async () => {
    const assetResponse = await request(app)
      .post('/api/assets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Main Pump',
        code: 'AS-001',
        category: 'Pump',
        manufacturer: 'Acme',
        model: 'P-100',
        serialNumber: 'SN-001',
        plantId: '507f1f77bcf86cd799439011',
      })
      .expect(201);

    const deviceResponse = await request(app)
      .post('/api/devices')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        assetId: assetResponse.body.data.id,
        name: 'Pump Controller',
        ipAddress: '192.168.1.10',
        protocol: 'ModbusTCP',
        port: 502,
        modbusAddress: 1,
        communicationType: 'Ethernet',
        pollingInterval: 30,
      })
      .expect(201);

    expect(assetResponse.body.data).toMatchObject({
      code: 'AS-001',
      category: 'Pump',
      status: 'active',
    });
    expect(deviceResponse.body.data).toMatchObject({
      assetId: assetResponse.body.data.id,
      protocol: 'ModbusTCP',
      status: 'online',
    });
  });

  it('supports search, filters, and status updates for assets and devices', async () => {
    const assetListResponse = await request(app)
      .get('/api/assets')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ search: 'Main', category: 'Pump', status: 'active' })
      .expect(200);

    expect(assetListResponse.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'AS-001' })]),
    );

    const assetResponse = await request(app)
      .patch('/api/assets/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'maintenance' })
      .expect(404);

    expect(assetResponse.body.message).toBe('Asset not found');

    const deviceListResponse = await request(app)
      .get('/api/devices')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(deviceListResponse.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ protocol: 'ModbusTCP' })]),
    );

    const deviceId = deviceListResponse.body.data[0].id;
    const simulatedStatusResponse = await request(app)
      .post(`/api/devices/${deviceId}/simulate-status`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(simulatedStatusResponse.body.data.status).toEqual(expect.any(String));
  });
});
