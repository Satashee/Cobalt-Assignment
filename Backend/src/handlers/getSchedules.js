const { loadSchedules } = require("../utils/fileUtils");

/**
 * GET /slack/message/schedules
 */
module.exports = function getSchedulesHandler(_req, res) {
  res.json(loadSchedules());
};
