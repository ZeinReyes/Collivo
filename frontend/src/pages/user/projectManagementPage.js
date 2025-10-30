import React from "react";
import PMSidebar from "../../components/user/PMSidebar";
import PMTopNavbar from "../../components/user/PMTopNavbar";
import { Outlet } from "react-router-dom";
import "./projectManagementPage.css";

function ProjectManagementPage() {
  return (
    <div className="pm-container">
      <PMSidebar />
      <div className="pm-main">
        <PMTopNavbar />
        <div className="pm-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default ProjectManagementPage;
