import React, { useState, useEffect } from "react";
import { Modal, Button, Form, ListGroup, Badge } from "react-bootstrap";
import api from "../../api/api";

function InviteMembersModal({ show, handleClose, projectId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // 🔍 Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) return setSuggestions([]);
      try {
        const res = await api.get(`/users/search?query=${searchTerm}`);
        setSuggestions(res.data);
      } catch (err) {
        console.error("Error fetching user suggestions:", err);
      }
    };
    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleSelectUser = (user) => {
    if (!selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm("");
    setSuggestions([]);
  };

  const handleRemoveUser = (id) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== id));
  };

  const handleSendInvites = async () => {
  const token = localStorage.getItem("token");
  if (!token) return alert("You are not logged in");

  try {
    // Map through selected users and send invites
    const results = await Promise.all(
      selectedUsers.map(async (user) => {
        try {
          const response = await api.post(
            "/invites",
            { projectId, recipientEmail: user.email },
            {
              headers: { Authorization: `Bearer ${token}` }, // use cached token
            }
          );
          return { user: user.email, success: true, data: response.data };
        } catch (err) {
          console.error(`Error sending invite to ${user.email}:`, err.response?.data || err);
          return { user: user.email, success: false, error: err.response?.data?.message || err.message };
        }
      })
    );

    // Separate successes and failures
    const failedInvites = results.filter((r) => !r.success);
    if (failedInvites.length) {
      alert(`Failed to send invites to: ${failedInvites.map((f) => f.user).join(", ")}`);
    } else {
      alert("All invites sent successfully!");
    }

    // Clear selected users and close modal
    setSelectedUsers([]);
    handleClose();
  } catch (err) {
    console.error("Unexpected error sending invites:", err);
    alert("Something went wrong. Please try again.");
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
            {suggestions.map((user) => (
              <ListGroup.Item key={user._id} action onClick={() => handleSelectUser(user)}>
                {user.fullName} ({user.username}) <small>{user.email}</small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {selectedUsers.length > 0 && (
          <div className="mb-3">
            {selectedUsers.map((u) => (
              <Badge
                key={u._id}
                bg="info"
                className="me-2 p-2"
                style={{ cursor: "pointer" }}
                onClick={() => handleRemoveUser(u._id)}
              >
                {u.fullName || u.username} ×
              </Badge>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="success" onClick={handleSendInvites}>Send Invites</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default InviteMembersModal;
