import React, { useContext } from "react";
import { LogOut } from "lucide-react";
import { AuthContext } from "../../contexts/authContext";

function TopNavbar() {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    window.location.href = "/login"; 
  };

  return (
    <div className="topNavbar d-flex justify-content-between align-items-center">
      <h5 className="mt-3">
        Welcome,{" "}
        <span className="fw-semibold">
          {user?.username || user?.email || "Admin"}!
        </span>
      </h5>
      <button className="logoutBtn btn btn-danger d-flex align-items-center gap-2" onClick={handleLogout}>
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}

export default TopNavbar;
