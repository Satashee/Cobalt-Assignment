// src/pages/Send.jsx
import React, { useState, useEffect } from "react";
import useChannels from "../hooks/useChannels";
import { AnimatePresence } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import axios from "axios";

export default function Send() {
  const { channels, loading } = useChannels();
  const [channel, setChannel] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState(null);
  const [sentList, setSentList] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    axios
      .get("/slack/message/sent")
      .then((res) => setSentList(res.data))
      .catch(console.error);
  }, [status]);

  const handleSend = async () => {
    setStatus("sending");
    try {
      const { data } = await axios.post("/slack/message/send", {
        channel,
        text,
      });
      setStatus(`sent-${data.ts}`);
      setText("");
      setPage(1);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      setStatus(`error-${errMsg}`);
    }
  };

  if (loading) return <p>Loading channels…</p>;

  const sorted = [...sentList].sort(
    (a, b) => new Date(a.sent_at) - new Date(b.sent_at)
  );

  const perPage = 10;
  const totalPages = Math.ceil(sorted.length / perPage);
  const pageItems = sorted.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left: send form */}
      <div className="space-y-6 p-6 bg-white shadow rounded">
        <h2 className="text-2xl font-semibold">Send a Message</h2>

        <div>
          <label className="block text-sm font-medium">Channel</label>
          <select
            className="mt-1 block w-full border px-3 py-2 rounded"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="" disabled>
              — pick a channel —
            </option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea
            className="mt-1 block w-full border px-3 py-2 rounded"
            rows="4"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!channel || !text || status === "sending"}
          className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send Now"}
        </button>

        {status && (
          <p
            className={`mt-2 text-sm ${
              status.startsWith("sent") ? "text-green-600" : "text-red-600"
            }`}
          >
            {status.startsWith("sent")
              ? `✅ Sent at ${new Date(
                  parseFloat(status.split("-")[1]) * 1000
                ).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}`
              : `❌ ${status.replace("error-", "")}`}
          </p>
        )}
      </div>

      {/* Right: sent list */}
      <AnimatePresence>
        <PageWrapper>
          <div className="p-6 bg-white shadow rounded flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">Sent Messages</h2>

            {sorted.length === 0 ? (
              <p className="text-gray-500">No messages sent yet.</p>
            ) : (
              <>
                <ul className="space-y-4 flex-1 overflow-auto">
                  {pageItems.map((item) => (
                    <li
                      key={item.id}
                      className="border-l-4 border-green-600 bg-gray-50 p-4 rounded"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            #{channels.find((c) => c.id === item.channel)?.name}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {item.text}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>
                            {new Date(item.sent_at).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center items-center space-x-4">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={page === totalPages}
                      className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </PageWrapper>
      </AnimatePresence>
    </div>
  );
}
