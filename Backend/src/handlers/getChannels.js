// backend/src/handlers/getChannels.js
const { loadTokens, saveTokens } = require("../utils/fileUtils");
const { refreshAccessToken, callSlack } = require("../services/tokenService");

module.exports = async function getChannelsHandler(_req, res) {
  try {
    let { access_token, expires_in, saved_at } = loadTokens();
    const age = Math.floor((Date.now() - (saved_at || 0)) / 1000);
    if (age > expires_in - 60) {
      access_token = await refreshAccessToken();
      const updated = loadTokens();
      saveTokens({ ...updated, saved_at: Date.now() });
    }
    const data = await callSlack(
      "conversations.list",
      { types: "public_channel,private_channel", limit: 1000 },
      access_token
    );
    const simplified = data.channels.map((c) => ({ id: c.id, name: c.name }));
    res.json(simplified);
  } catch (err) {
    console.error("Error listing channels:", err);
    res.status(500).json({ error: err.error || err.message });
  }
};
