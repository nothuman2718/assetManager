import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../app.js';
import { hashPassword } from '../modules/auth/password.service.js';
import { signAuthToken } from '../modules/auth/token.service.js';
import { UserModel } from '../modules/users/user.model.js';
import { connectDatabase, disconnectDatabase } from '../shared/database/mongodb.js';

describe('dashboard routes', () => {
  const app = createApp();
  const testEmail = 'phase7.dashboard@example.com';
  let authToken = '';

  beforeAll(async () => {
    await connectDatabase();

    await UserModel.deleteMany({ email: testEmail });
    const user = await UserModel.create({
      name: 'Dashboard Tester',
      email: testEmail,
      passwordHash: await hashPassword('Password123!'),
      role: 'Operator',
      status: 'active',
    });
    authToken = signAuthToken({ sub: user.id, role: 'Operator' });
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: testEmail });
    await disconnectDatabase();
  });

  it('returns summary metrics for authenticated users', async () => {
    const response = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data).toMatchObject({
      totalPlants: expect.any(Number),
      totalBuildings: expect.any(Number),
      totalAssets: expect.any(Number),
      totalDevices: expect.any(Number),
      onlineDevices: expect.any(Number),
      offlineDevices: expect.any(Number),
      maintenanceDue: expect.any(Number),
      upcomingMaintenance: expect.any(Number),
      overdueMaintenance: expect.any(Number),
    });
  });

  it('returns chart buckets, maintenance summary, and recent assets without empty database errors', async () => {
    const [assetsByCategory, deviceStatus, maintenance, recentAssets] = await Promise.all([
      request(app).get('/api/dashboard/assets-by-category').set('Authorization', `Bearer ${authToken}`).expect(200),
      request(app).get('/api/dashboard/device-status').set('Authorization', `Bearer ${authToken}`).expect(200),
      request(app).get('/api/dashboard/maintenance').set('Authorization', `Bearer ${authToken}`).expect(200),
      request(app).get('/api/dashboard/recent-assets').set('Authorization', `Bearer ${authToken}`).expect(200),
    ]);

    expect(Array.isArray(assetsByCategory.body.data)).toBe(true);
    expect(deviceStatus.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'online', count: expect.any(Number) }),
        expect.objectContaining({ label: 'offline', count: expect.any(Number) }),
      ]),
    );
    expect(maintenance.body.data).toMatchObject({
      upcoming: expect.any(Number),
      overdue: expect.any(Number),
      byStatus: expect.any(Array),
    });
    expect(Array.isArray(recentAssets.body.data)).toBe(true);
  });

  it('requires authentication', async () => {
    await request(app).get('/api/dashboard/summary').expect(401);
  });
});
