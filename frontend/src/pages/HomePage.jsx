import { useEffect, useState } from "react";
import { pingBackend } from "../api/httpClient";

export default function HomePage() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    pingBackend()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div>
      <h1>Live Flash Auction – Frontend is running</h1>
      <p>Backend health: {status}</p>
    </div>
  );
}
