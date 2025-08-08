const {
  loadTokens,
  saveTokens,
  loadSent,
  saveSent,
} = require("../utils/fileUtils");
const { refreshAccessToken, callSlack } = require("../services/tokenService");

module.exports = async function postSendHandler(req, res) {
  try {
    // 1) ensure bot token is fresh
    let { access_token, expires_in, saved_at } = loadTokens();
    const age = Math.floor((Date.now() - (saved_at || 0)) / 1000);
    if (age > expires_in - 60) {
      access_token = await refreshAccessToken();
      const updated = loadTokens();
      saveTokens({ ...updated, saved_at: Date.now() });
    }

    const { channel, text } = req.body;
    let ts;

    // 2) try postMessage
    try {
      const data = await callSlack(
        "chat.postMessage",
        { channel, text },
        access_token
      );
      ts = data.ts;
    } catch (err) {
      if (err.error === "not_in_channel") {
        await callSlack("conversations.join", { channel }, access_token);
        const data2 = await callSlack(
          "chat.postMessage",
          { channel, text },
          access_token
        );
        ts = data2.ts;
      } else {
        throw err;
      }
    }

    // 3) record the sent message
    const sent = loadSent();
    const id = Date.now().toString();
    sent.push({ id, channel, text, ts, sent_at: new Date().toISOString() });
    saveSent(sent);

    return res.json({ ok: true, ts });
  } catch (err) {
    console.error("postSendHandler error:", err);
    res.status(500).json({ error: err.error || err.message });
  }
};
