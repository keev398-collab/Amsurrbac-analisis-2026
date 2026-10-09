// Almacenamiento en Upstash Redis (Vercel Marketplace) vía REST, sin dependencias.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function cmd(args) {
  if (!URL_ || !TOKEN) throw new Error('Falta configurar la base de datos (Upstash Redis)');
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || 'Error de base de datos (' + r.status + ')');
  return j.result;
}

module.exports = {
  get: (key) => cmd(['GET', 'club:' + key]),
  set: (key, value) => cmd(['SET', 'club:' + key, value]),
};
