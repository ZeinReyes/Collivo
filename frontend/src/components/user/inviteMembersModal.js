import React, { useState, useEffect, useContext } from "react";
import { Modal, Button, Form, ListGroup, Badge, Spinner } from "react-bootstrap";
import api from "../../api/api";
import { AuthContext } from "../../contexts/authContext";
import { useToast } from "../../hooks/useToast";
import { FiX } from "react-icons/fi";

function InviteMembersModal({ show, handleClose, projectId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const token = localStorage.getItem("token");

        const res = await api.get(
          `/users/search?query=${encodeURIComponent(searchTerm)}&projectId=${projectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let data = res.data || [];

        const filtered = data.filter(
          (u) =>
            !selectedUsers.some((s) => s._id === u._id || s.email === u.email)
        );

        setSuggestions(filtered);
      } catch (err) {
        console.error("Error fetching user suggestions:", err);
      }
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [searchTerm, projectId, selectedUsers]);

  const handleSelectUser = (u) => {
    setSelectedUsers((prev) => [...prev, { ...u, role: "Member" }]);
    setSearchTerm("");
    setSuggestions([]);
  };

  const handleRemoveUser = (id) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== id));
  };

  const handleRoleChange = (index, newRole) => {
    setSelectedUsers((prev) =>
      prev.map((u, i) => (i === index ? { ...u, role: newRole } : u))
    );
  };

  const handleSendInvites = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      addToast({ type: "error", message: "You are not logged in." });
      return;
    }

    if (selectedUsers.length === 0) {
      addToast({ type: "warning", message: "Select at least one user." });
      return;
    }

    setLoading(true);
    try {
      await Promise.all(
        selectedUsers.map(async (u) => {
          try {
            await api.post(
              "/invites",
              { projectId, recipientEmail: u.email, role: u.role },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { success: true };
          } catch {
            return { success: false, email: u.email };
          }
        })
      );

      setSelectedUsers([]);
      setSearchTerm("");
      handleClose();

      addToast({
        type: "success",
        message: "Invitations sent successfully!",
        duration: 3000,
      });
    } catch {
      addToast({ type: "error", message: "Failed to send invites." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>Invite Members</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Search Users</Form.Label>
          <Form.Control
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type name, username, or email..."
          />
        </Form.Group>

        {suggestions.length > 0 && (
          <ListGroup className="mb-3">
            {suggestions.map((u) => (
              <ListGroup.Item key={u._id} action onClick={() => handleSelectUser(u)}>
                {u.fullName || u.username}{" "}
                <small className="text-muted">({u.email})</small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {selectedUsers.length > 0 && (
          <div
            className="mb-3 p-2"
            style={{
              maxHeight: "150px",
              overflowY: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: "#fafafa",
            }}
          >
            {selectedUsers.map((u, index) => (
              <div
                key={u._id}
                className="d-flex align-items-center justify-content-between mb-2"
                style={{
                  background: "white",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <div className="d-flex align-items-center">
                  <Badge bg="info" className="p-2 me-2">
                    {u.fullName || u.username}
                  </Badge>

                  <Form.Select
                    value={u.role}
                    onChange={(e) => handleRoleChange(index, e.target.value)}
                    style={{ width: "120px", fontSize: "0.85rem" }}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                    <option value="Viewer">Viewer</option>
                  </Form.Select>
                </div>

                <FiX
                  size={18}
                  color="#dc3545"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemoveUser(u._id)}
                />
              </div>
            ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleSendInvites} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : "Send Invites"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default InviteMembersModal;
