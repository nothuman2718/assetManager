import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../app.js';

describe('health route', () => {
  it('returns API health status', async () => {
    const app = createApp();

    const response = await request(app).get('/api/health').expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'ems-asset-registry-api',
    });
    expect(response.body.timestamp).toEqual(expect.any(String));
  });
});
