import { useEffect, useState } from 'react'

import './App.css'

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div>
      <h1> Hello World from PawPal </h1>
      <p>Message from Express backend, connected to Vite+React frontend:</p>
      <p>{message}</p>
    </div>
  );
}

export default App
