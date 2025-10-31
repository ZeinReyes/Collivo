import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

function InviteResponse() {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
  const fetchInviteDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/invites/${inviteId}`);
      if (res.status === 200) {
        setRole(res.data.role);
        setStatus(res.data.status);
      }
    } catch (err) {
      setError("Failed to load invite details.");
    } finally {
      setLoading(false);
    }
  };

  fetchInviteDetails();
}, [inviteId]);

  const handleResponse = async (action) => {
    try {
      setLoading(true);
      setError("");

      const res = await api.post(`/invites/${inviteId}/respond`, { action });

      if (res.status === 200) {
        setStatus(action === "accept" ? "Accepted" : "Declined");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isActionDone = status !== "Pending";

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.card,
          borderTop: `5px solid ${
            status === "Accepted" ? "#28a745" : status === "Declined" ? "#dc3545" : "#007bff"
          }`,
        }}
      >
        <h1
          style={{
            ...styles.title,
            color: status === "Accepted" ? "#28a745" : status === "Declined" ? "#dc3545" : "#007bff",
          }}
        >
          {status === "Accepted"
            ? "🎉 Invite Accepted!"
            : status === "Declined"
            ? "❌ Invite Declined"
            : "📩 Project Invite"}
        </h1>

        {role && (
          <p style={{ fontWeight: "600", marginBottom: "10px" }}>
            Assigned Role: <span style={{ color: "#007bff" }}>{role}</span>
          </p>
        )}

        <p style={styles.text}>
          {status === "Accepted"
            ? "You have successfully joined the project."
            : status === "Declined"
            ? "You have declined the project invitation."
            : "Do you want to accept or decline this project invitation?"}
        </p>

        {!isActionDone ? (
          <div style={styles.buttonContainer}>
            <button
              style={{ ...styles.button, background: "#28a745" }}
              onClick={() => handleResponse("accept")}
              disabled={loading}
            >
              Accept
            </button>
            <button
              style={{ ...styles.button, background: "#dc3545" }}
              onClick={() => handleResponse("decline")}
              disabled={loading}
            >
              Decline
            </button>
          </div>
        ) : (
          <button
            style={{ ...styles.button, background: "#007bff" }}
            onClick={() => navigate("/project-management/projects")}
          >
            Go to Projects
          </button>
        )}

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f0f4f8",
    padding: "20px",
  },
  card: {
    background: "white",
    padding: "40px 30px",
    borderRadius: "15px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: "450px",
    transition: "all 0.3s ease-in-out",
  },
  title: {
    marginBottom: "20px",
    fontSize: "1.8rem",
  },
  text: {
    marginBottom: "30px",
    color: "#555",
    lineHeight: "1.5",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "15px",
  },
  button: {
    padding: "12px 25px",
    color: "white",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
    transition: "background 0.3s",
  },
  error: {
    color: "#dc3545",
    marginTop: "15px",
  },
};

export default InviteResponse;
