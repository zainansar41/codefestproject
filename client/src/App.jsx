import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import VerifyEmail from "./Pages/VerifyEmail";
import Navbar from "./components/Navbar";
import Workspace from "./Pages/Workspace";
import { ToastContainer } from 'react-toastify';
import WorkspaceContent from "./Pages/WorkspaceContent";
import InviteTeamLead from "./Pages/InviteTeamLead";
import InviteMember from "./Pages/InviteMember";

function App() {
  const location = useLocation();
  // Hide Navbar on login, signup, and verify-email routes
  const shouldShowNavbar = location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/verify-email';
  
  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/workspace" element={<Workspace />} /> {/* General workspace page */}
        <Route path="/workspace/:id" element={<WorkspaceContent />} /> {/* Dynamic path for individual workspaces */}
        <Route path="/invite-team-lead" element={<InviteTeamLead />} /> {/* Dynamic path for individual workspaces */}
        <Route path="/invite-member" element={<InviteMember />} /> {/* Dynamic path for individual workspaces */}
      </Routes>
    </>
  );
}

export default App;
