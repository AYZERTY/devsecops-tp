const express = require('express');
const { execFile } = require('node:child_process');
const { isIP } = require('node:net');
const escapeHtml = require('lodash/escape');
const { rateLimit } = require('express-rate-limit');
const app = express();
app.disable('x-powered-by');
app.set('query parser', 'simple');

function validHost(host) {
  if (typeof host !== 'string' || host.length === 0 || host.length > 253) return false;
  if (/^[\d.]+$/.test(host)) return isIP(host) === 4;
  return host.split('.').every((label) =>
    /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label));
}

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/hello', (req, res) => {
  const name = req.query.name || 'inconnu';
  if (typeof name !== 'string' || name.length > 100) {
    return res.status(400).json({ error: 'Nom invalide' });
  }
  res.type('html').send(`<h1>Bonjour ${escapeHtml(name)}</h1>`);
});

const pingLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Trop de requêtes, réessaie dans une minute' },
});

app.get('/ping', pingLimiter, (req, res) => {
  const host = req.query.host;
  if (!validHost(host)) return res.status(400).json({ error: 'Hôte invalide' });
  execFile('ping', ['-c', '1', host], { timeout: 3000, maxBuffer: 65536 }, (err, stdout) => {
    if (err) return res.status(502).json({ error: 'Hôte injoignable' });
    res.type('text').send(stdout);
  });
});

app.get('/prefs', (req, res) => {
  const allowed = ['theme', 'lang'];
  if (Object.keys(req.query).some((key) => !allowed.includes(key))) {
    return res.status(400).json({ error: 'Préférence inconnue' });
  }
  const { theme = 'light', lang = 'fr' } = req.query;
  if (!['light', 'dark'].includes(theme) || !['fr', 'en'].includes(lang)) {
    return res.status(400).json({ error: 'Préférence invalide' });
  }
  res.json({ theme, lang });
});

module.exports = app;
