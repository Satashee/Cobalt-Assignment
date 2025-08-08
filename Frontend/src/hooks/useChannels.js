import { useState, useEffect } from "react";
import axios from "axios";

export default function useChannels() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/slack/conversations/list")
      .then((res) => {
        // res.data is an array of { id, name }
        setChannels(res.data.map((c) => ({ id: c.id, name: c.name })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { channels, loading };
}
