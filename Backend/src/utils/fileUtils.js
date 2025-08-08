const fs = require("fs");
const path = require("path");

const TOKEN_PATH = path.resolve(__dirname, "../../tokens.json");
const SCHEDULE_PATH = path.resolve(__dirname, "../..//schedules.json");
const SENT_PATH = path.resolve(__dirname, "../../sent.json");

function loadTokens() {
  const raw = fs.readFileSync(TOKEN_PATH);
  return JSON.parse(raw);
}

function loadSent() {
  try {
    return JSON.parse(fs.readFileSync(SENT_PATH));
  } catch {
    return [];
  }
}

function saveSent(arr) {
  fs.writeFileSync(SENT_PATH, JSON.stringify(arr, null, 2));
}

function saveTokens(tokens) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
}

function loadSchedules() {
  const raw = fs.readFileSync(SCHEDULE_PATH);
  return JSON.parse(raw);
}

function saveSchedules(arr) {
  fs.writeFileSync(SCHEDULE_PATH, JSON.stringify(arr, null, 2));
}

module.exports = {
  loadTokens,
  saveTokens,
  loadSchedules,
  saveSchedules,
  loadSent,
  saveSent,
};
