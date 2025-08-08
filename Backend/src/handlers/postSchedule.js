const { loadSchedules, saveSchedules } = require("../utils/fileUtils");

/**
 * POST /slack/message/schedule
 * Body: { channel: string, text: string, send_at: string (ISO datetime) }
 */
module.exports = function postScheduleHandler(req, res) {
  const { channel, text, send_at } = req.body;
  const sendTime = new Date(send_at).getTime();

  if (isNaN(sendTime) || sendTime <= Date.now()) {
    return res.status(400).json({ error: "Invalid or past send_at" });
  }

  const schedules = loadSchedules();
  const id = Date.now().toString();
  schedules.push({ id, channel, text, send_at, status: "pending" });
  saveSchedules(schedules);

  res.json({ ok: true, id, channel, text, send_at });
};
