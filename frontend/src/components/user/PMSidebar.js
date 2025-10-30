import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FolderKanban, CheckSquare, Settings } from "lucide-react";

const PMSidebar = () => {
  return (
    <aside className="pm-sidebar">
      <div className="pm-logo">
        <img src="/images/logo.png" alt="Collivo Logo" />
        <h3>Collivo</h3>
      </div>

      <nav className="pm-nav">
        <NavLink
          to="/project-management"
          end
          className={({ isActive }) => `pm-link ${isActive ? "active" : ""}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/project-management/projects"
          className={({ isActive }) => `pm-link ${isActive ? "active" : ""}`}
        >
          <FolderKanban size={18} />
          <span>Projects</span>
        </NavLink>

        <NavLink
          to="/project-management/tasks"
          className={({ isActive }) => `pm-link ${isActive ? "active" : ""}`}
        >
          <CheckSquare size={18} />
          <span>Tasks</span>
        </NavLink>

        <NavLink
          to="/project-management/settings"
          className={({ isActive }) => `pm-link ${isActive ? "active" : ""}`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default PMSidebar;
