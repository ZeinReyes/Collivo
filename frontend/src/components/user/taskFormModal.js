// src/components/tasks/TaskFormModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const TaskFormModal = ({
  show,
  onHide,
  mode = "create", // "create" | "edit"
  initialData = {},
  onSubmit,
  projectMembers = [],
}) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignedTo: [],
    priority: "Medium",
  });
  const [memberQuery, setMemberQuery] = useState("");

  useEffect(() => {
    if (initialData && mode === "edit") {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        dueDate: initialData.dueDate
          ? initialData.dueDate.slice(0, 16)
          : "",
        assignedTo:
          (initialData.assignedTo || []).map(
            (a) => a.user?._id || a.user?.id || a?._id
          ) || [],
        priority: initialData.priority || "Medium",
      });
    } else {
      setForm({
        title: "",
        description: "",
        dueDate: "",
        assignedTo: [],
        priority: "Medium",
      });
    }
    setMemberQuery("");
  }, [initialData, mode]);

  const handleMemberToggle = (userId, checked) => {
    setForm((prev) => {
      const assigned = checked
        ? [...prev.assignedTo, userId]
        : prev.assignedTo.filter((id) => id !== userId);
      return { ...prev, assignedTo: assigned };
    });
  };

  const filteredMembers = projectMembers.filter((m) => {
    const user = m.user || {};
    const name = (user.fullName || user.username || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    return (
      name.includes(memberQuery.toLowerCase()) ||
      email.includes(memberQuery.toLowerCase())
    );
  });

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === "edit" ? "Edit Task" : "Create New Task"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Assign Members</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search members..."
              className="mb-2"
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
            />

            {memberQuery && (
              <div
                className="border rounded p-2 mb-2"
                style={{ maxHeight: "180px", overflowY: "auto" }}
              >
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((m) => {
                    const user = m.user || {};
                    const id = user._id || user.id;
                    return (
                      <Form.Check
                        key={id}
                        type="checkbox"
                        label={`${user.fullName || user.username} (${user.email})`}
                        checked={form.assignedTo.includes(id)}
                        onChange={(e) =>
                          handleMemberToggle(id, e.target.checked)
                        }
                      />
                    );
                  })
                ) : (
                  <div className="text-muted small">
                    No matching members.
                  </div>
                )}
              </div>
            )}

            {form.assignedTo.length > 0 && (
              <div className="mt-2">
                <strong>Assigned Members:</strong>
                <ul className="mb-0 mt-1">
                  {form.assignedTo.map((id) => {
                    const member = projectMembers.find(
                      (m) => (m.user._id || m.user.id) === id
                    );
                    const user = member?.user;
                    if (!user) return null;
                    return (
                      <li key={id}>
                        {user.fullName || user.username} ({user.email}){" "}
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="py-0 px-1 ms-2"
                          onClick={() => handleMemberToggle(id, false)}
                        >
                          ✕
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {mode === "edit" ? "Save Changes" : "Create Task"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskFormModal;
