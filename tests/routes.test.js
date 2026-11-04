const request = require('supertest');
jest.mock('node:child_process', () => ({ execFile: jest.fn() }));
const { execFile } = require('node:child_process');
const app = require('../src/app');

beforeEach(() => {
  execFile.mockReset();
  execFile.mockImplementation((file, args, options, callback) => callback(null, '1 packet received'));
});

test('utilise le nom par défaut', async () => {
  const res = await request(app).get('/hello');
  expect(res.text).toBe('<h1>Bonjour inconnu</h1>');
});

test('échappe aussi les guillemets, apostrophes et esperluettes', async () => {
  const res = await request(app).get('/hello').query({ name: `"'&<>` });
  expect(res.text).toBe('<h1>Bonjour &quot;&#39;&amp;&lt;&gt;</h1>');
});

test.each(['/hello?name=a&name=b', '/hello?name=' + 'a'.repeat(101)])(
  'refuse un nom invalide : %s', async (url) => {
    expect((await request(app).get(url)).status).toBe(400);
  });

test.each(['example.com', '127.0.0.1', 'mon-serveur.local'])(
  'passe %s en argument sans shell', async (host) => {
    const res = await request(app).get('/ping').query({ host });
    expect(res.status).toBe(200);
    expect(res.type).toBe('text/plain');
    expect(res.text).toBe('1 packet received');
    expect(execFile).toHaveBeenCalledWith('ping', ['-c', '1', host],
      { timeout: 3000, maxBuffer: 65536 }, expect.any(Function));
  });

test.each(['', '-c', 'a b', 'a\nb', '$(id)', 'a|id', 'a..b', '-a.com',
  'a-.com', '999.999.1.1', 'a'.repeat(64) + '.com', 'a'.repeat(254)])(
  'refuse un hôte invalide : %s', async (host) => {
    const res = await request(app).get('/ping').query({ host });
    expect(res.status).toBe(400);
    expect(execFile).not.toHaveBeenCalled();
  });

test.each(['/ping', '/ping?host=a&host=b'])('refuse un hôte absent ou multiple : %s', async (url) => {
  expect((await request(app).get(url)).status).toBe(400);
  expect(execFile).not.toHaveBeenCalled();
});

test('renvoie une erreur générique si ping échoue', async () => {
  execFile.mockImplementation((file, args, options, callback) => callback(new Error('détail interne')));
  const res = await request(app).get('/ping?host=example.com');
  expect(res.status).toBe(502);
  expect(res.body).toEqual({ error: 'Hôte injoignable' });
});

test('renvoie les préférences par défaut', async () => {
  expect((await request(app).get('/prefs')).body).toEqual({ theme: 'light', lang: 'fr' });
});

test('accepte uniquement les préférences prévues', async () => {
  const res = await request(app).get('/prefs?theme=dark&lang=en');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ theme: 'dark', lang: 'en' });
});

test.each(['__proto__[admin]=true', 'admin=true', 'theme[admin]=true', 'theme=dark&theme=light',
  'theme=invalid', 'lang=invalid'])('refuse les préférences invalides : %s', async (query) => {
  const res = await request(app).get('/prefs?' + query);
  expect(res.status).toBe(400);
  expect(Object.prototype.admin).toBeUndefined();
});
