// backend/src/handlers/getChannels.js
const { loadTokens, saveTokens } = require("../utils/fileUtils");
const { refreshAccessToken, callSlack } = require("../services/tokenService");

module.exports = async function getChannelsHandler(_req, res) {
  try {
    // 1) ensure bot token is fresh
    let { access_token, expires_in, saved_at } = loadTokens();
    const age = Math.floor((Date.now() - (saved_at || 0)) / 1000);
    if (age > expires_in - 60) {
      access_token = await refreshAccessToken();
      const updated = loadTokens();
      saveTokens({ ...updated, saved_at: Date.now() });
    }

    // 2) call Slack to list channels
    const data = await callSlack(
      "conversations.list",
      { types: "public_channel,private_channel", limit: 1000 },
      access_token
    );

    // 3) simplify & return
    const simplified = data.channels.map((c) => ({ id: c.id, name: c.name }));
    res.json(simplified);
  } catch (err) {
    console.error("Error listing channels:", err);
    res.status(500).json({ error: err.error || err.message });
  }
};
