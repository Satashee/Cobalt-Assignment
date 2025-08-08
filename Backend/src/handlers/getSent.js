const { loadSent } = require("../utils/fileUtils");
/**
 * GET /slack/message/sent
 */
module.exports = function getSentHandler(_req, res) {
  const sent = loadSent();
  res.json(sent);
};
