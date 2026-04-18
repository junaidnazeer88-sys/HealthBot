import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import FirstAid from "./pages/FirstAid";
import FacilityLocator from "./pages/FacilityLocator";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/first-aid" element={<FirstAid />} />
        <Route path="/facilities" element={<FacilityLocator />} />
      </Routes>
    </Router>
  );
}

export default App;
