const { isEditor } = require('../../lib/auth');
const store = require('../../lib/store');

const CLAVES = new Set(['partidos', 'jugadores', 'club', 'pizarras']);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const key = req.query.key;
  if (!CLAVES.has(key)) return res.status(404).json({ error: 'Clave inválida' });

  try {
    if (req.method === 'GET') {
      // Lectura pública (modo solo lectura)
      const v = await store.get(key);
      if (v === null || v === undefined) return res.status(404).json({ error: 'No encontrado' });
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).send(v);
    }

    if (req.method === 'PUT') {
      if (!isEditor(req)) return res.status(401).json({ error: 'No autorizado' });
      const b = req.body;
      const texto = typeof b === 'string' ? b : JSON.stringify(b);
      JSON.parse(texto); // valida que sea JSON
      await store.set(key, texto);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
