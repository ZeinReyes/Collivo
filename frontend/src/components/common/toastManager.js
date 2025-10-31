import React, { useEffect } from "react";
import { X, Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";

function ToastManager({ toasts = [], removeToast = () => {} }) {// ✅ added safe defaults
  useEffect(() => {
    // Auto-remove toasts when duration expires
    toasts.forEach((toast) => {
      if (!toast.timeoutId) {
        const id = setTimeout(() => removeToast(toast.id), toast.duration || 4000);
        toast.timeoutId = id;
      }
    });
  }, [toasts, removeToast]);

  const getBackgroundColor = (type) => {
    switch (type) {
      case "success":
        return "#16a34a"; // green
      case "error":
        return "#dc2626"; // red
      case "warning":
        return "#f59e0b"; // amber
      default:
        return "#1e3a8a"; // blue
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} color="white" />;
      case "error":
        return <XCircle size={20} color="white" />;
      case "warning":
        return <AlertTriangle size={20} color="white" />;
      default:
        return <Info size={20} color="white" />;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      {toasts.length > 0 ? (
        toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1.25rem",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
              backgroundColor: getBackgroundColor(toast.type),
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              animation: "slideIn 0.3s ease forwards",
              minWidth: "260px",
              transition: "transform 0.2s ease, opacity 0.2s ease",
            }}
          >
            {getIcon(toast.type)}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <X size={16} color="white" />
          </div>
        ))
      ) : null}

      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
}

export default ToastManager;
