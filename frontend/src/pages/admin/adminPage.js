import React from "react";
import Sidebar from "../../components/admin/adminSidebar";
import TopNavbar from "../../components/admin/adminTopNavbar";
import UserTable from "../../components/admin/userTable";
import "./adminPage.css";

function AdminPage() {
  return (
    <div className="adminContainer">
      <Sidebar />
      <div className="mainContent">
        <TopNavbar />
        <div className="contentArea">
          <h2 className="sectionTitle">User Management</h2>
          <UserTable />
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
