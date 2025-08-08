// backend/src/handlers/getUser.js
const axios = require("axios");
const { loadTokens, saveTokens } = require("../utils/fileUtils");
const { refreshAccessToken, callSlack } = require("../services/tokenService");

module.exports = async function getUserHandler(_req, res) {
  try {
    const tokens = loadTokens();
    const userCreds = tokens.authed_user;
    if (userCreds?.access_token) {
      const authResp = await axios.post(
        "https://slack.com/api/auth.test",
        null,
        { headers: { Authorization: `Bearer ${userCreds.access_token}` } }
      );
      if (authResp.data.ok) {
        return res.json({
          connected: true,
          user: { display_name: authResp.data.user },
        });
      }
      console.warn("auth.test failed:", authResp.data.error);
    }
    const userId = tokens.authed_user?.id;
    if (userId) {
      let { access_token, expires_in, saved_at } = tokens;
      const age = Math.floor((Date.now() - (saved_at || 0)) / 1000);
      if (age > expires_in - 60) {
        access_token = await refreshAccessToken();
        const updated = loadTokens();
        saveTokens({ ...updated, saved_at: Date.now() });
      }

      const info = await callSlack(
        "users.info",
        { user: userId },
        access_token
      );
      const p = info.user.profile;
      return res.json({
        connected: true,
        user: {
          display_name: p.display_name || p.real_name,
          real_name: p.real_name,
        },
      });
    }
    return res.json({ connected: false });
  } catch (err) {
    console.error("Error in getUserHandler:", err);
    return res.json({ connected: false });
  }
};
