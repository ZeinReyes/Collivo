import React, { useState, useEffect, useContext } from "react";
import { Modal, Button, Form, ListGroup, Badge, Spinner } from "react-bootstrap";
import api from "../../api/api";
import { AuthContext } from "../../contexts/authContext";
import { useToast } from "../../hooks/useToast";

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
        const res = await api.get(
          `/users/search?query=${encodeURIComponent(searchTerm)}&projectId=${projectId}`
        );
        let data = res.data || [];

        const filtered = data.filter(
          (u) =>
            !selectedUsers.some(
              (s) => s._id === u._id || s.id === u.id || s.email === u.email
            )
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
    if (!selectedUsers.some((s) => s._id === u._id || s.id === u.id)) {
      setSelectedUsers((prev) => [...prev, u]);
    }
    setSearchTerm("");
    setSuggestions([]);
  };

  const handleRemoveUser = (id) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== id && u.id !== id));
  };

  const handleSendInvites = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("🟥 Toast Triggered: Not logged in");
      addToast({
        type: "error",
        message: "You are not logged in.",
        duration: 4000,
      });
      return;
    }

    if (selectedUsers.length === 0) {
      console.log("🟨 Toast Triggered: No users selected");
      addToast({
        type: "warning",
        message: "Please select at least one user to invite.",
        duration: 4000,
      });
      return;
    }

    setLoading(true);
    try {
      const results = await Promise.all(
        selectedUsers.map(async (u) => {
          try {
            const res = await api.post(
              "/invites",
              { projectId, recipientEmail: u.email },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { success: true, email: u.email, data: res.data };
          } catch (err) {
            return {
              success: false,
              email: u.email,
              error: err.response?.data?.message || err.message,
            };
          }
        })
      );

      const failed = results.filter((r) => !r.success);
      const successful = results.filter((r) => r.success);

      if (successful.length > 0) {
        console.log(`🟩 Toast Triggered: ${successful.length} invite(s) sent`);
        addToast({
          type: "success",
          message: `${successful.length} invite(s) sent successfully!`,
          duration: 3000,
        });
      }

      if (failed.length > 0) {
        failed.forEach((f) => {
          console.log(`🟥 Toast Triggered: Failed to invite ${f.email}`);
          addToast({
            type: "error",
            message: `Failed to invite ${f.email}: ${f.error}`,
            duration: 5000,
          });
        });
      }

      setSelectedUsers([]);
      setSearchTerm("");
      setSuggestions([]);
      handleClose();
    } catch (err) {
      console.error("Error sending invites:", err);
      console.log("🟥 Toast Triggered: Invite process error");
      addToast({
        type: "error",
        message: "Something went wrong while sending invites.",
        duration: 4000,
      });
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
              <ListGroup.Item
                key={u._id || u.id}
                action
                onClick={() => handleSelectUser(u)}
              >
                {u.fullName || u.username}{" "}
                <small className="text-muted">({u.email})</small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {selectedUsers.length > 0 && (
          <div className="mb-3">
            {selectedUsers.map((u) => (
              <Badge
                key={u._id || u.id}
                bg="info"
                className="me-2 p-2"
                style={{ cursor: "pointer" }}
                onClick={() => handleRemoveUser(u._id || u.id)}
              >
                {u.fullName || u.username} ×
              </Badge>
            ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={handleSendInvites}
          disabled={loading || selectedUsers.length === 0}
        >
          {loading ? <Spinner size="sm" animation="border" /> : "Send Invites"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default InviteMembersModal;
