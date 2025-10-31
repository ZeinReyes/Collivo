// src/components/user/TaskFormModal.js
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import api from "../../api/api";

function TaskFormModal({ show, handleClose, projectId, task, refreshTasks }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignees, setAssignees] = useState([]); // array of user IDs
  const [members, setMembers] = useState([]); // project members
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form and fetch members when modal opens
  useEffect(() => {
    if (!show) return;

    // Reset form fields
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "Medium");
      setStartDate(task.startDate?.split("T")[0] || "");
      setDueDate(task.dueDate?.split("T")[0] || "");
      setAssignees(task.assignees?.map((a) => a.user?._id || a._id) || []);
    } else {
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setStartDate("");
      setDueDate("");
      setAssignees([]);
    }

    fetchProjectMembers();
  }, [task, show, projectId]);

  // Fetch project members
  const fetchProjectMembers = async () => {
    if (!projectId) return;

    try {
      const res = await api.get(`/projects/${projectId}/members`);
      setMembers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch members", err.response || err);
      setError("Failed to load project members.");
    }
  };

  // Toggle assignee checkbox
  const handleCheckboxChange = (userId) => {
    setAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Submit task
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!projectId) {
      setError("Invalid project.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title,
        description,
        priority,
        startDate,
        dueDate,
        assignees,
        projectId,
      };

      if (task) {
        await api.put(`/tasks/${task._id}`, payload);
      } else {
        await api.post("/tasks", payload);
      }

      handleClose();
      refreshTasks();
    } catch (err) {
      console.error("Error saving task:", err);
      setError("Failed to save task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{task ? "Edit Task" : "New Task"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Priority</Form.Label>
            <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Due Date</Form.Label>
            <Form.Control
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Assign Members</Form.Label>
            {members.length === 0 ? (
              <p className="text-muted">No members available</p>
            ) : (
              <div className="d-flex flex-column">
                {members.map((m) => (
                  <Form.Check
                    key={m.user._id}
                    type="checkbox"
                    label={`${m.user.fullName} (${m.role})`}
                    checked={assignees.includes(m.user._id)}
                    onChange={() => handleCheckboxChange(m.user._id)}
                  />
                ))}
              </div>
            )}
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "Save Task"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default TaskFormModal;
