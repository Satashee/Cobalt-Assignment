
# Slack Connect

A simple full-stack app that lets users connect their Slack workspace, send messages immediately, and schedule messages for future delivery—using **local JSON files** for storage.

> **Status:** This documentation covers the project in its local-storage form (no production deployment or cloud DB).

---
# ScreenShots
### Home Screen
![WhatsApp Image 2025-08-08 at 16 35 42_e3c21838](https://github.com/user-attachments/assets/52d222cd-f511-480b-a2c0-eed6a9b45e16)
### Connecting Slack
![WhatsApp Image 2025-08-08 at 16 38 24_ff72287c](https://github.com/user-attachments/assets/9582e394-7652-4e80-82d4-e4407f3a9ee9)
### Successful Login
![WhatsApp Image 2025-08-08 at 16 38 55_23ff24f5](https://github.com/user-attachments/assets/67fb5258-6925-4363-88f3-1c0b798d7145)
### Single Message Sending
![WhatsApp Image 2025-08-08 at 16 39 06_cecba5f5](https://github.com/user-attachments/assets/06a7eb5d-02c8-4936-b63b-edae5e57ac3b)
### Schedule a Message
![WhatsApp Image 2025-08-08 at 16 39 16_cc958592](https://github.com/user-attachments/assets/7de08051-9f85-4fd7-a35f-ff86635c7783)
### Scheduling a Message
![WhatsApp Image 2025-08-08 at 16 39 48_e3e3ec07](https://github.com/user-attachments/assets/827ab444-4fd2-4238-a363-bff14ff97485)
### Succussfully Recieving a Message
![WhatsApp Image 2025-08-08 at 16 40 05_0ee92e54](https://github.com/user-attachments/assets/9250338b-70cd-484d-a381-8001ac17ca8f)


## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Project Structure](#project-structure)
5. [Environment Variables](#environment-variables)
6. [Backend Setup](#backend-setup)
   - [Local JSON Storage](#local-json-storage)
   - [Key Modules & Helpers](#key-modules--helpers)
   - [API Endpoints](#api-endpoints)
   - [Scheduler Loop](#scheduler-loop)
7. [Frontend Setup](#frontend-setup)
   - [Pages & Hooks](#pages--hooks)
   - [Vite Proxy Configuration](#vite-proxy-configuration)
8. [Usage](#usage)
9. [Next Steps](#next-steps)

---

## Features

- **OAuth 2.0** flow to connect a Slack workspace
- **Immediate** message sending
- **Scheduled** message creation, listing, cancellation
- **Simple local persistence** via JSON files (`tokens.json`, `schedules.json`, `sent.json`)
- **RESTful** API + React frontend

---

## Tech Stack

- **Backend**: Node.js, Express.js, Axios
- **Storage**: Local JSON files (`data/*.json`)
- **Scheduler**: `setInterval` loop in Node
- **Frontend**: Vite + React + React Router + Axios

---

## Prerequisites

- Node.js v16+
- A Slack App with:
  - **Redirect URI**: `http://localhost:3000/slack/oauth/callback`
  - **Scopes**:
    - Bot scopes: `chat:write`, `channels:read`, `channels:join`, `users:read`
    - User scopes: `users:read`
- A `.env` file in the **backend** root

---

## Project Structure
```

.
├── backend
│ ├── data
│ │ ├── tokens.json
│ │ ├── schedules.json
│ │ └── sent.json
│ ├── src
│ │ ├── config.js
│ │ ├── index.js
│ │ ├── utils
│ │ │ └── fileUtils.js
│ │ ├── services
│ │ │ └── tokenService.js
│ │ └── handlers
│ │ ├── getOauthCallback.js
│ │ ├── getChannels.js
│ │ ├── postSend.js
│ │ ├── postSchedule.js
│ │ ├── getSchedules.js
│ │ ├── deleteSchedule.js
│ │ └── getUser.js
│ └── package.json
└── frontend
├── src
│ ├── App.jsx
│ ├── main.jsx
│ ├── pages
│ │ ├── Connect.jsx
│ │ ├── Send.jsx
│ │ └── Schedule.jsx
│ └── hooks
│ └── useChannels.js
├── vite.config.js
└── package.json

````

---

## Environment Variables

Create a `.env` in `backend/`:

```dotenv
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
SLACK_REDIRECT_URI=http://localhost:3000/slack/oauth/callback
SESSION_SECRET=a-long-random-string
PORT=3000
````

> The frontend uses Vite’s default `import.meta.env`.

---

## Backend Setup

```bash
cd backend
npm install
npm start
```

### Local JSON Storage

- **`data/tokens.json`**
  Stores the OAuth tokens:

  ```json
  {
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 43200,
    "scope": "...",
    "bot_user_id": "...",
    "team": { "id": "...", "name": "..." },
    "authed_user": { "id": "U...", "access_token": "...", ... },
    "saved_at": 169...
  }
  ```

- **`data/schedules.json`**
  Array of scheduled jobs:

  ```json
  [
    { "id":"169...", "channel":"C...", "text":"Hi", "send_at":"2025-08-08T10:00:00.000Z", "status":"pending" },
    ...
  ]
  ```

- **`data/sent.json`**
  Array of sent messages:

  ```json
  [
    { "id":"169...", "channel":"C...", "text":"Hello", "ts":"169...", "sent_at":"2025-08-08T09:00:00.000Z" },
    ...
  ]
  ```

### Key Modules & Helpers

- **`fileUtils.js`**
  Synchronous wrappers around `fs.readFileSync` / `fs.writeFileSync` for the three JSON files.

- **`tokenService.js`**

  - `refreshAccessToken()`: uses Slack’s `oauth.v2.access` to refresh the bot token.
  - `callSlack(method,payload,token)`: generic POST to `https://slack.com/api/{method}`.

### API Endpoints

1. **GET `/slack/oauth/authorize`**
   Redirects to Slack’s OAuth consent screen.

2. **GET `/slack/oauth/callback?code=…`**
   Exchanges code → tokens, auto-joins `#general`, saves to `tokens.json`.

3. **GET `/slack/conversations/list`**
   Returns `[ { id, name }, ... ]` of public & private channels.

4. **POST `/slack/message/send`**
   Body: `{ channel, text }` → sends immediately, records to `sent.json`.

5. **POST `/slack/message/schedule`**
   Body: `{ channel, text, send_at }` → appends to `schedules.json`.

6. **GET `/slack/message/schedules`**
   Returns the array from `schedules.json`.

7. **DELETE `/slack/message/schedule/:id`**
   Marks a pending job as `cancelled` in `schedules.json`.

8. **GET `/slack/user`**
   Returns `{ connected: true, user: { display_name, real_name } }` via `auth.test` or `users.info`.

### Scheduler Loop

In `index.js`:

```js
setInterval(async () => {
  const now = Date.now();
  const schedules = loadSchedules();
  const pending = schedules.filter(
    (job) => job.status === "pending" && new Date(job.send_at) <= now
  );
  // refresh token if expired…
  // for each pending: callSlack("chat.postMessage", …)
  // update status to "sent" or "failed"
  saveSchedules(schedules);
}, 60 * 1000);
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Pages & Hooks

- **`pages/Connect.jsx`**
  Button → GET `/slack/oauth/authorize`.

- **`hooks/useChannels.js`**
  Fetches `GET /slack/conversations/list` → channel list.

- **`pages/Send.jsx`**
  Form to pick channel & text → POST `/slack/message/send`.
  Displays human-readable timestamp.

- **`pages/Schedule.jsx`**
  Form + `datetime-local` → POST `/slack/message/schedule`.
  Lists existing schedules → GET `/slack/message/schedules`.
  Cancel button → DELETE `/slack/message/schedule/:id`.

### Vite Proxy Configuration

In `vite.config.js`:

```js
export default defineConfig({
  server: {
    proxy: {
      "/slack": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
```

This lets your React app call `/slack/*` without CORS.

---

## Usage

1. **Start backend**: `cd backend && npm start`
2. **Start frontend**: `cd frontend && npm run dev`
3. Open `http://localhost:5173` in your browser.
4. Click **Connect Slack**, complete OAuth.
5. Navigate to **Send**, pick a channel, send a message.
6. Navigate to **Schedule**, schedule a future message, see it listed, cancel if needed.

---

## Next Steps

- Replace JSON files with a real database (Redis, Postgres).
- Deploy to Vercel / Render with environment-specific configs.
- Enhance UI styling, add user feedback & error handling.
- Add pagination, sorting, filtering on the frontend.

```
::contentReference[oaicite:0]{index=0}
```
