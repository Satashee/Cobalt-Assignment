const express = require("express");
const { refreshAccessToken, callSlack } = require("./services/tokenService");
const app = express();
const PORT = process.env.PORT || 3000;
const getRoutes = require("./routes/get");
const postRoutes = require("./routes/post");
const {
  loadTokens,
  saveTokens,
  loadSchedules,
  saveSchedules,
} = require("./utils/fileUtils");

require("dotenv").config();
app.use(express.json());

getRoutes(app);
postRoutes(app);

// Existing root endpoint
app.get("/", (_req, res) => {
  res.send("🚀 Slack Connect Backend (JS) is up!");
});

// 🔄 Simple in-memory scheduler loop
setInterval(async () => {
  try {
    const schedules = loadSchedules();
    const now = Date.now();
    const pending = schedules.filter(
      (item) =>
        item.status === "pending" && new Date(item.send_at).getTime() <= now
    );
    if (!pending.length) return;

    let tokens = loadTokens();
    let token = tokens.access_token;
    const age = Math.floor((Date.now() - (tokens.saved_at || 0)) / 1000);
    if (age > tokens.expires_in - 60) {
      token = await refreshAccessToken();
      tokens = loadTokens();
      saveTokens({ ...tokens, saved_at: Date.now() });
    }

    for (let job of pending) {
      try {
        // send it
        const resp = await callSlack(
          "chat.postMessage",
          { channel: job.channel, text: job.text },
          token
        );
        // mark as sent
        job.status = "sent";
        job.sent_at = new Date().toISOString();
        job.ts = resp.ts;
      } catch (err) {
        console.error(`Failed to send scheduled ${job.id}:`, err.error || err);
        // optionally mark as 'failed' or leave as pending to retry
        job.status = "failed";
        job.error = err.error || err.message;
      }
    }

    // persist updates
    saveSchedules(schedules);
  } catch (e) {
    console.error("Scheduler loop error:", e);
  }
}, 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
