const { setSessionCookie } = require('../lib/auth');

module.exports = (req, res) => {
  setSessionCookie(res, '', 0);
  res.status(200).json({ ok: true });
};
