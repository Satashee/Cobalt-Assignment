// backend/src/handlers/getOauthCallback.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { callSlack } = require("../services/tokenService");

module.exports = async function getOauthCallback(req, res) {
  const code = req.query.code;
  try {
    const { data } = await axios.get("https://slack.com/api/oauth.v2.access", {
      params: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: process.env.SLACK_REDIRECT_URI,
      },
    });
    if (!data.ok) {
      return res.status(500).send(`OAuth error: ${data.error}`);
    }

    const access = data.access_token;
    const convs = await callSlack(
      "conversations.list",
      { types: "public_channel", limit: 1000 },
      access
    );
    const general = convs.channels.find((c) => c.name === "general");
    if (general) {
      try {
        await callSlack("conversations.join", { channel: general.id }, access);
      } catch (err) {
        if (err.error !== "already_in_channel") {
          console.warn("Failed to join #general:", err);
        }
      }
    }
    const tokenPayload = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      scope: data.scope,
      bot_user_id: data.bot_user_id,
      app_id: data.app_id,
      team: data.team,
      authed_user: {
        id: data.authed_user.id,
        access_token: data.authed_user.access_token,
        refresh_token: data.authed_user.refresh_token,
        expires_in: data.authed_user.expires_in,
        scope: data.authed_user.scope,
      },
      saved_at: Date.now(),
    };

    fs.writeFileSync(
      path.resolve(__dirname, "../../tokens.json"),
      JSON.stringify(tokenPayload, null, 2)
    );

    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173/");
  } catch (err) {
    console.error("OAuth failed:", err);
    res.status(500).send("❌ OAuth process failed. Check logs.");
  }
};
