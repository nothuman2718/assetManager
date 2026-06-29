import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../app.js';
import { hashPassword } from '../modules/auth/password.service.js';
import { signAuthToken } from '../modules/auth/token.service.js';
import { BuildingModel } from '../modules/hierarchy/building.model.js';
import { DepartmentModel } from '../modules/hierarchy/department.model.js';
import { PanelModel } from '../modules/hierarchy/panel.model.js';
import { PlantModel } from '../modules/hierarchy/plant.model.js';
import { UserModel } from '../modules/users/user.model.js';
import { connectDatabase, disconnectDatabase } from '../shared/database/mongodb.js';

describe('hierarchy routes', () => {
  const app = createApp();
  const testEmail = 'phase3.hierarchy@example.com';
  const testPassword = 'Password123!';
  let authToken = '';

  beforeAll(async () => {
    await connectDatabase();

    await Promise.all([
      PlantModel.deleteMany({}),
      BuildingModel.deleteMany({}),
      DepartmentModel.deleteMany({}),
      PanelModel.deleteMany({}),
      UserModel.deleteMany({ email: testEmail }),
    ]);

    const user = await UserModel.create({
      name: 'Hierarchy Tester',
      email: testEmail,
      passwordHash: await hashPassword(testPassword),
      role: 'Admin',
      status: 'active',
    });

    authToken = signAuthToken({ sub: user.id, role: 'Admin' });
  });

  afterAll(async () => {
    await Promise.all([
      PlantModel.deleteMany({}),
      BuildingModel.deleteMany({}),
      DepartmentModel.deleteMany({}),
      PanelModel.deleteMany({}),
      UserModel.deleteMany({ email: testEmail }),
    ]);
    await disconnectDatabase();
  });

  it('creates a plant, building, department, and panel through the hierarchy API', async () => {
    const plantResponse = await request(app)
      .post('/api/plants')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'North Plant', code: 'PL-001' })
      .expect(201);

    const buildingResponse = await request(app)
      .post('/api/buildings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Main Building', code: 'BL-001', plantId: plantResponse.body.data.id })
      .expect(201);

    const departmentResponse = await request(app)
      .post('/api/departments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Production', code: 'DP-001', buildingId: buildingResponse.body.data.id })
      .expect(201);

    const panelResponse = await request(app)
      .post('/api/panels')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Panel A', code: 'PN-001', departmentId: departmentResponse.body.data.id })
      .expect(201);

    expect(plantResponse.body.data).toMatchObject({ code: 'PL-001', status: 'active' });
    expect(buildingResponse.body.data).toMatchObject({ code: 'BL-001', status: 'active' });
    expect(departmentResponse.body.data).toMatchObject({ code: 'DP-001', status: 'active' });
    expect(panelResponse.body.data).toMatchObject({ code: 'PN-001', status: 'active' });
  });

  it('returns a nested hierarchy tree with all levels', async () => {
    const response = await request(app)
      .get('/api/hierarchy/tree')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'PL-001',
          buildings: expect.arrayContaining([
            expect.objectContaining({
              code: 'BL-001',
              departments: expect.arrayContaining([
                expect.objectContaining({
                  code: 'DP-001',
                  panels: expect.arrayContaining([
                    expect.objectContaining({ code: 'PN-001' }),
                  ]),
                }),
              ]),
            }),
          ]),
        }),
      ]),
    );
  });
});
