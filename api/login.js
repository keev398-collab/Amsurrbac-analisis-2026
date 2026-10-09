const { configured, makeToken, safeEqual, setSessionCookie, MAX_AGE } = require('../lib/auth');

// Límite de intentos por IP (en memoria; suficiente para frenar fuerza bruta básica)
const intentos = new Map();
const VENTANA = 10 * 60 * 1000;
const MAX_INTENTOS = 5;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!configured()) {
    return res.status(500).json({ error: 'Faltan variables de entorno: ADMIN_USER, ADMIN_PASSWORD, SESSION_SECRET' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconocida';
  const ahora = Date.now();
  const reg = intentos.get(ip);
  if (reg && ahora - reg.desde < VENTANA && reg.n >= MAX_INTENTOS) {
    return res.status(429).json({ error: 'Demasiados intentos' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const okUser = safeEqual(body.usuario || '', process.env.ADMIN_USER);
  const okPass = safeEqual(body.clave || '', process.env.ADMIN_PASSWORD);

  if (okUser && okPass) {
    intentos.delete(ip);
    setSessionCookie(res, makeToken(), MAX_AGE);
    return res.status(200).json({ ok: true });
  }

  const vigente = reg && ahora - reg.desde < VENTANA;
  intentos.set(ip, vigente ? { desde: reg.desde, n: reg.n + 1 } : { desde: ahora, n: 1 });
  return res.status(401).json({ error: 'Credenciales incorrectas' });
};
