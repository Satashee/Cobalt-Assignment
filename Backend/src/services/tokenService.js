// backend/src/services/tokenService.js
const axios = require("axios");
const { loadTokens, saveTokens } = require("../utils/fileUtils");

/**
 * Uses the refresh_token in tokens.json to get a new access_token.
 * Saves the updated tokens back to tokens.json.
 * @returns {Promise<string>} the fresh access_token
 */
async function refreshAccessToken() {
  const { refresh_token } = loadTokens();
  const resp = await axios.post("https://slack.com/api/oauth.v2.access", null, {
    params: {
      grant_type: "refresh_token",
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      refresh_token,
    },
  });
  const data = resp.data;
  if (!data.ok) {
    throw new Error(`Refresh failed: ${data.error}`);
  }
  // merge in the new tokens
  const updated = {
    ...loadTokens(),
    access_token: data.access_token,
    refresh_token: data.refresh_token || refresh_token,
    expires_in: data.expires_in,
  };
  saveTokens(updated);
  return updated.access_token;
}

async function callSlack(method, payload, token) {
  const resp = await axios.post(`https://slack.com/api/${method}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.data.ok) throw resp.data;
  return resp.data;
}

module.exports = { refreshAccessToken, callSlack };
