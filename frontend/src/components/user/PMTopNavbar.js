import React, { useState, useContext } from "react";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { AuthContext } from "../../contexts/authContext";

const PMTopNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <header className="pm-topbar">
      <h4>
        Welcome,{" "}
        <span className="fw-semibold">
          {user?.username || user?.email || "User"}!
        </span>
      </h4>

      <div className="pm-profile">
        <div
          className="pm-profile-trigger"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="User Avatar"
              className="pm-avatar"
            />
          ) : (
            <div className="pm-avatar-fallback">
              {user?.username?.charAt(0).toUpperCase() ||
                user?.email?.charAt(0).toUpperCase() ||
                "U"}
            </div>
          )}
          <span>{user?.username || "User"}</span>
          <ChevronDown size={16} />
        </div>

        {dropdownOpen && (
          <div className="pm-dropdown">
            <button>
              <User size={16} /> Profile
            </button>
            <button>
              <Settings size={16} /> Account Settings
            </button>
            <button className="logout" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default PMTopNavbar;
