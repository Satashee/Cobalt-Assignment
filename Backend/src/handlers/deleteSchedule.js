const { loadSchedules, saveSchedules } = require("../utils/fileUtils");

/**
 * DELETE /slack/message/schedule/:id
 * Marks a pending scheduled message as "cancelled"
 */
module.exports = function deleteScheduleHandler(req, res) {
  const schedules = loadSchedules();
  const job = schedules.find((s) => s.id === req.params.id);

  if (!job) {
    return res.status(404).json({ error: "Not found" });
  }
  if (job.status !== "pending") {
    return res
      .status(400)
      .json({ error: `Cannot cancel a job with status "${job.status}"` });
  }

  job.status = "cancelled";
  job.cancelled_at = new Date().toISOString();
  saveSchedules(schedules);

  res.json({
    ok: true,
    id: job.id,
    status: job.status,
    cancelled_at: job.cancelled_at,
  });
};
