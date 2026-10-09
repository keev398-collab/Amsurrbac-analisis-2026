const crypto = require('crypto');

const COOKIE = 'club_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 días

const secret = () => process.env.SESSION_SECRET || '';
const sign = (v) => crypto.createHmac('sha256', secret()).update(v).digest('hex');

// Comparación en tiempo constante (hash previo para igualar longitudes)
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function configured() {
  return !!(process.env.ADMIN_USER && process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET);
}

function makeToken() {
  const payload = 'editor.' + (Math.floor(Date.now() / 1000) + MAX_AGE);
  return payload + '.' + sign(payload);
}

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return '';
}

function isEditor(req) {
  if (!secret()) return false;
  const token = readCookie(req, COOKIE);
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'editor') return false;
  const payload = parts[0] + '.' + parts[1];
  if (!safeEqual(parts[2], sign(payload))) return false;
  return Number(parts[1]) > Math.floor(Date.now() / 1000);
}

function setSessionCookie(res, token, maxAge) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
  );
}

module.exports = { MAX_AGE, configured, makeToken, isEditor, safeEqual, setSessionCookie };
