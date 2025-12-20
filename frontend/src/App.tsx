import { useEffect, useState } from 'react'

import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import api from "./services/api"

function TemporaryHomePage({ message }: { message: string }) {
  return (
    <div>
      <h1> Hello World from PawPal </h1>
      <p>Message from Express backend, connected to Vite+React frontend:</p>
      <p>{message}</p>
    </div>
  );
}


function App() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    api.get("/").then((res) => setMessage(res.data.message));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TemporaryHomePage message={message} />} />
        {/* <Route path="/login" element={<Login />} /> 
        <Route path="/register" element={<Register />} /> These are for future use*/}
      </Routes>
    </BrowserRouter>
  );
}

export default App
