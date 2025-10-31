import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./contexts/authContext";
import VerifyEmailPage from "./pages/authentication/verifyEmailPage";

// Authentication
import LoginPage from "./pages/authentication/loginPage";
import RegisterPage from "./pages/authentication/registerPage";
import ForgotPasswordPage from "./pages/authentication/forgotPasswordPage";
import ResetPasswordPage from "./pages/authentication/resetPasswordPage";

// Admin
import AdminPage from "./pages/admin/adminPage";

// Landing
import HomePage from "./pages/landing page/homePage";
import AboutPage from "./pages/landing page/aboutPage";
import ContactPage from "./pages/landing page/contactPage";

// User (Project Management)
import ProjectManagement from "./pages/user/projectManagementPage";
import Dashboard from "./pages/user/dashboardPage";
import ProjectsList from "./pages/user/projectLists";
import AcceptInvite from "./components/user/acceptInvite"

// Project
import ProjectPage from "./pages/project/projectPage";
import OverviewPage from "./pages/project/overviewPage";
import MembersPage from "./pages/project/membersPage";
import TasksPage from "./pages/project/tasksPage";

// Others
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function ProtectedRoute({ element, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return element;
}

function App() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Landing Pages */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Admin Page */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute element={<AdminPage />} allowedRoles={["Admin"]} />
        }
      />

      {/* Project Management */}
      <Route path="/project-management" element={<ProjectManagement />}>
        <Route index element={<Dashboard />} /> {/* default */}
        <Route path="projects" element={<ProjectsList />} />

        <Route path="projects/:id" element={<ProjectPage />}>
          <Route index element={<OverviewPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="tasks/*" element={<TasksPage />} />
        </Route>

        <Route path="invites/:inviteId" element={<AcceptInvite />} />
      </Route>
    </Routes>
    
  );
}

export default App;
