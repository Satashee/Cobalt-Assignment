module.exports = function (app) {
  app.post("/slack/message/send", require("../handlers/postSend"));
  app.post("/slack/message/schedule", require("../handlers/postSchedule"));
};
