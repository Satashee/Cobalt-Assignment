const { loadSchedules } = require("../utils/fileUtils");

/**
 * GET /slack/message/schedules
 * Responds with the array from schedules.json
 */
module.exports = function getSchedulesHandler(_req, res) {
  res.json(loadSchedules());
};
