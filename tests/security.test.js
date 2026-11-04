const request = require('supertest');

// Aucun processus système n'est lancé, même avec l'ancien code.
jest.mock('node:child_process', () => ({
  exec: jest.fn((command, callback) => callback(null, 'simulation')),
  execFile: jest.fn((file, args, options, callback) => callback(null, 'simulation')),
}));
const { exec, execFile } = require('node:child_process');
const app = require('../src/app');
beforeEach(() => jest.clearAllMocks());

test('échappe le HTML au lieu de renvoyer un script exécutable', async () => {
  const res = await request(app).get('/hello').query({ name: '<script>alert(1)</script>' });
  expect(res.status).toBe(200);
  expect(res.text).not.toContain('<script>');
  expect(res.text).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
});

test('refuse une injection de commande avant tout lancement de processus', async () => {
  const res = await request(app).get('/ping').query({ host: 'google.com;cat /etc/passwd' });
  expect(res.status).toBe(400);
  expect(exec).not.toHaveBeenCalled();
  expect(execFile).not.toHaveBeenCalled();
});

test('refuse les clés de prototype et ne pollue pas les objets', async () => {
  const res = await request(app).get('/prefs?constructor[prototype][admin]=true');
  expect(res.status).toBe(400);
  expect(Object.prototype.admin).toBeUndefined();
  expect({}.admin).toBeUndefined();
});
