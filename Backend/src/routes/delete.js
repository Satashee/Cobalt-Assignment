module.exports = function (app) {
  app.delete(
    "/slack/message/schedule/:id",
    require("../handlers/deleteSchedule")
  );
};
