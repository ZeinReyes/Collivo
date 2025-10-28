import React from "react";
import { Users } from "lucide-react";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebarHeader">
        <img src="/logo.png" alt="Logo" className="sidebarLogo" />
        <h3>Collivo Admin</h3>
      </div>

      <ul className="sidebarMenu">
        <li className="active">
          <Users size={18} /> Users
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
