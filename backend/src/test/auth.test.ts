import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../app.js';
import { hashPassword } from '../modules/auth/password.service.js';
import { UserModel } from '../modules/users/user.model.js';
import { connectDatabase, disconnectDatabase } from '../shared/database/mongodb.js';

describe('auth routes', () => {
  const app = createApp();
  const testEmail = 'phase2.auth@example.com';
  const testPassword = 'Password123!';

  beforeAll(async () => {
    await connectDatabase();

    await UserModel.deleteMany({ email: testEmail });

    await UserModel.create({
      name: 'Phase 2 Tester',
      email: testEmail,
      passwordHash: await hashPassword(testPassword),
      role: 'Engineer',
      status: 'active',
      lastLoginAt: undefined,
    });
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: testEmail });
    await disconnectDatabase();
  });

  it('logs in with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword })
      .expect(200);

    expect(response.body.data).toMatchObject({
      token: expect.any(String),
      user: {
        email: testEmail,
        role: 'Engineer',
        status: 'active',
      },
    });
  });

  it('rejects invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'wrong-password' })
      .expect(401);

    expect(response.body.message).toBe('Invalid email or password');
  });

  it('returns the current user for a valid token', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword })
      .expect(200);

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.data.token}`)
      .expect(200);

    expect(response.body.data).toMatchObject({
      email: testEmail,
      role: 'Engineer',
      status: 'active',
    });
  });
});
