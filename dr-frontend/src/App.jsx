import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RegistrationPage from "./pages/RegistrationPage";
import SuccessPage from "./pages/SuccessPage";
import OfflinePage from "./pages/OfflinePage";
import socket from "./socket";

function AppContent() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      // If we were on offline page, go back to home
      if (window.location.pathname === "/offline") {
        navigate("/");
      }
    }

    function onDisconnect() {
      setIsConnected(false);
      navigate("/offline");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<RegistrationPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/offline" element={<OfflinePage />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

