const request = require('supertest');
jest.mock('node:child_process', () => ({
  execFile: jest.fn((file, args, options, callback) => callback(null, 'simulation')),
}));
const { execFile } = require('node:child_process');
const app = require('../src/app');

test('limite ping à 30 requêtes par minute et par IP', async () => {
  for (let i = 0; i < 30; i += 1) {
    expect((await request(app).get('/ping?host=127.0.0.1')).status).toBe(200);
  }
  const res = await request(app).get('/ping?host=127.0.0.1');
  expect(res.status).toBe(429);
  expect(res.headers['retry-after']).toBeDefined();
  expect(execFile).toHaveBeenCalledTimes(30);
  expect((await request(app).get('/health')).status).toBe(200);
});
