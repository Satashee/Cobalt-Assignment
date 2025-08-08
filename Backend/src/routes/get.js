const getChannelsHandler = require("../handlers/getChannels");
const getSchedulesHandler = require("../handlers/getSchedules");
const getSentHandler = require("../handlers/getSent");

module.exports = function (app) {
  app.get("/slack/oauth/authorize", (_req, res) => {
    const params = new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID,
      scope: "chat:write,channels:read,channels:join,users:read",
      user_scope: "users:read",
      redirect_uri: process.env.SLACK_REDIRECT_URI,
    });
    res.redirect(`https://slack.com/oauth/v2/authorize?${params.toString()}`);
  });

  app.get("/slack/oauth/callback", require("../handlers/getOauthCallback"));
  app.get("/slack/message/schedules", getSchedulesHandler);
  app.get("/slack/conversations/list", getChannelsHandler);
  app.get("/slack/message/sent", getSentHandler);
  app.get("/slack/user", require("../handlers/getUser"));
};
