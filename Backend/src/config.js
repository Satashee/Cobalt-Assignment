require("dotenv").config();
const path = require("path");

module.exports = {
  PORT: process.env.PORT || 3000,
  TOKEN_PATH: path.resolve(__dirname, "../data/tokens.json"),
  SCHEDULE_PATH: path.resolve(__dirname, "../data/schedules.json"),
  SENT_PATH: path.resolve(__dirname, "../data/sent.json"),
  SLACK: {
    CLIENT_ID: process.env.SLACK_CLIENT_ID,
    CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
    REDIRECT_URI: process.env.SLACK_REDIRECT_URI,
    SCOPES: "chat:write,channels:read,channels:join,users:read",
    USER_SCOPES: "users:read",
  },
};
