'use strict';

const request = require('supertest');
const app = require('../index');

describe('Accounts API (integration)', () => {
  test('Health endpoint returns UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'UP');
  });

  test('Create account validation', async () => {
    const res = await request(app).post('/accounts').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
