import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import api from "./services/api";
import Login from "./pages/Login";
import "./App.css";

function TemporaryHomePage({ message }: { message: string }) {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Hello World from PawPal</h1>
      <p>Message from Express backend, connected to Vite + React frontend:</p>
      <p>
        <strong>{message}</strong>
      </p>
    </div>
  );
}

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Health check (integration test)
    api.get("/health")
      .then((res) => {
        console.log("Health check OK:", res.data);
      })
      .catch((err) => {
        console.error("Health check failed:", err);
      });

    // Root endpoint test
    api.get("/")
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((err) => {
        console.error("Root endpoint failed:", err);
      });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TemporaryHomePage message={message} />} />
        <Route path="/login" element={<Login />} />

        {/*
          Future routes:
          <Route path="/register" element={<Register />} />
        */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;