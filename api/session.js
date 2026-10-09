const { isEditor } = require('../lib/auth');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ editor: isEditor(req) });
};
