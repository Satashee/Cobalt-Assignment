// src/pages/Connect.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SlackLogo from "../assets/Slack_Technologies_Logo.svg";

export default function Connect() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/slack/user")
      .then((res) => {
        if (res.data.connected) {
          setUser(res.data.user);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500 text-lg">Checking Slack connection…</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <img src={SlackLogo} alt="Slack Connect" className="h-12 mb-6" />
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
          <span>✅</span>
          <h1 className="text-2xl font-semibold mb-2">
            Hey {user.display_name}!
          </h1>
          <p className="text-gray-600 mb-6">
            Your Slack workspace is successfully connected. You can now send
            messages instantly or schedule them for later.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/send"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Send a Message
            </Link>
            <Link
              to="/schedule"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Schedule a Message
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <img src={SlackLogo} alt="Slack Connect" className="h-12 mb-6" />
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold mb-4">Slack Connect</h1>
        <p className="text-gray-600 mb-6">
          Link your Slack workspace to start sending and scheduling messages.
        </p>
        <button
          onClick={() => (window.location.href = "/slack/oauth/authorize")}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Connect to Slack
        </button>
      </div>
    </div>
  );
}
