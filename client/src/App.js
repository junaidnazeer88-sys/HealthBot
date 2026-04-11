import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // 👈 Import it here
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import FirstAid from "./pages/FirstAid";

function App() {
  return (
    <Router>
      <Navbar /> {/* 👈 Place it right here above the Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/first-aid" element={<FirstAid />} />
      </Routes>
    </Router>
  );
}

export default App;
