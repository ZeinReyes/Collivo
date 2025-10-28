import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./contexts/authContext";
import VerifyEmailPage from "./pages/authentication/verifyEmailPage";

// Import pages
import LoginPage from "./pages/authentication/loginPage";
import RegisterPage from "./pages/authentication/registerPage";
import ForgotPasswordPage from "./pages/authentication/forgotPasswordPage";
import ResetPasswordPage from "./pages/authentication/resetPasswordPage";
import AdminPage from "./pages/admin/adminPage";

// Others
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// ✅ Protected Route Component
function ProtectedRoute({ element, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return element;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute element={<AdminPage />} allowedRoles={["Admin"]} />
        }
      />
    </Routes>
  );
}

export default App;
