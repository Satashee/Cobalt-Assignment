const { loadSent } = require("../utils/fileUtils");
/**
 * GET /slack/message/sent
 * Responds with the array of sent messages from sent.json
 */
module.exports = function getSentHandler(_req, res) {
  const sent = loadSent();
  res.json(sent);
};
