// src/pages/Schedule.jsx
import React, { useState, useEffect } from "react";
import useChannels from "../hooks/useChannels";
import { AnimatePresence } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import axios from "axios";

export default function Schedule() {
  const { channels, loading } = useChannels();
  const [channel, setChannel] = useState("");
  const [text, setText] = useState("");
  const [sendAt, setSendAt] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [status, setStatus] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    axios
      .get("/slack/message/schedules")
      .then((res) => setSchedules(res.data))
      .catch(console.error);
  }, [status]);

  const handleSchedule = async () => {
    setStatus("scheduling");
    try {
      await axios.post("/slack/message/schedule", {
        channel,
        text,
        send_at: new Date(sendAt).toISOString(),
      });
      setStatus("scheduled");
      setText("");
      setPage(1);
    } catch (err) {
      setStatus(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  const cancel = async (id) => {
    await axios.delete(`/slack/message/schedule/${id}`);
    setStatus(`cancelled-${id}`);
  };

  if (loading) return <p>Loading channels…</p>;

  const sorted = [...schedules].sort(
    (a, b) => new Date(a.send_at) - new Date(b.send_at)
  );

  const perPage = 5;
  const totalPages = Math.ceil(sorted.length / perPage);
  const pageSchedules = sorted.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left: form */}
      <div className="space-y-6 p-6 bg-white shadow rounded">
        <h2 className="text-2xl font-semibold">Schedule a Message</h2>

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

        <div>
          <label className="block text-sm font-medium">Send at</label>
          <input
            type="datetime-local"
            className="mt-1 block w-full border px-3 py-2 rounded"
            value={sendAt}
            onChange={(e) => setSendAt(e.target.value)}
          />
        </div>

        <button
          onClick={handleSchedule}
          disabled={!channel || !text || !sendAt || status === "scheduling"}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "scheduling" ? "Scheduling…" : "Schedule"}
        </button>

        {status && (
          <p
            className={`mt-2 text-sm ${
              status.startsWith("Error") ? "text-red-600" : "text-green-600"
            }`}
          >
            {status.replace(/^scheduled$/, "✅ Scheduled!")}
          </p>
        )}
      </div>

      {/* Right: list */}
      <AnimatePresence>
        <PageWrapper>
          <div className="p-6 bg-white shadow rounded flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">Scheduled Messages</h2>
            {sorted.length === 0 ? (
              <p className="text-gray-500">No messages scheduled.</p>
            ) : (
              <>
                <ul className="space-y-4 flex-1 overflow-auto">
                  {pageSchedules.map((job) => (
                    <li
                      key={job.id}
                      className="border-l-4 border-blue-600 bg-gray-50 p-4 rounded"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            #{channels.find((c) => c.id === job.channel)?.name}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {job.text}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>
                            {new Date(job.send_at).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                          <p className="mt-1">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                job.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : job.status === "sent"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {job.status}
                            </span>
                          </p>
                        </div>
                      </div>
                      {job.status === "pending" && (
                        <button
                          onClick={() => cancel(job.id)}
                          className="mt-2 text-sm text-red-600 hover:underline"
                        >
                          Cancel
                        </button>
                      )}
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
