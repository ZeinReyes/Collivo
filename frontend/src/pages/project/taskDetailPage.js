import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Badge,
  Button,
  Spinner,
  Form,
  ListGroup,
  Row,
  Col,
  Modal,
} from "react-bootstrap";
import { AuthContext } from "../../contexts/authContext";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaTrash,
  FaUserCircle,
  FaCommentDots,
  FaSyncAlt,
  FaFileAlt,
} from "react-icons/fa";
import TaskFormModal from "../../components/user/taskFormModal";
import DeleteModal from "../../components/common/deleteModal";
import SubmitTaskModal from "../../components/user/submitTaskModal";

const statusColors = {
  "To Do": "secondary",
  "In Progress": "primary",
  "Subject for Approval": "warning",
  Approved: "success",
  Blocked: "danger",
};

const priorityColors = {
  Low: "success",
  Medium: "warning",
  High: "danger",
};

const allowedNextStatus = [
  "To Do",
  "In Progress",
  "Subject for Approval",
  "Approved",
];

const TaskDetails = () => {
  const { projectId, taskId } = useParams();
  const { token, user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [currentAttachment, setCurrentAttachment] = useState(null);

  const [newStatus, setNewStatus] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const [currentSubmission, setCurrentSubmission] = useState(null);

  // === Fetch Project and Task ===
  const fetchProject = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/projects/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProject(data);
    } catch (err) {
      console.error("Error fetching project:", err);
    }
  };

  const fetchTask = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:5000/api/tasks/project/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const found = data.find((t) => t._id === taskId);
      setTask(found);
    } catch (err) {
      console.error("Error fetching task:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    if (project) fetchTask();
  }, [project]);

  // === Role Logic ===
  const getProjectRole = () => {
    if (!project || !currentUser) return "member";
    const currentId = currentUser._id || currentUser.id;

    const ownerId =
      project.createdBy?._id ||
      project.owner?._id ||
      project.members?.find((m) => (m.role || "").toLowerCase() === "owner")
        ?.user?._id;

    if (ownerId && ownerId === currentId) return "owner";

    const memberEntry = (project.members || []).find(
      (m) =>
        (m.user?._id || m.user?.id || m._id || m.id) === currentId
    );

    return memberEntry?.role?.toLowerCase() || "member";
  };

  const role = getProjectRole();
  const canManage = ["owner", "admin"].includes(role);
  const isOwner = role === "owner";

  const isAssigned = task?.assignedTo?.some((a) => {
    const assignedId = a?.user?._id || a?.user?.id || a?._id || a?.id;
    const currentId = currentUser._id || currentUser.id;
    return assignedId === currentId;
  });

  // === Action Handlers ===
  const handleApprove = async () => {
    setConfirmAction({
      message: "Approve this task? This will mark it as completed and approved.",
      onConfirm: async () => {
        try {
          await axios.post(
            `http://localhost:5000/api/tasks/approve/${task._id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          fetchTask();
        } catch (err) {
          console.error("Error approving task:", err);
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleDelete = async () => {
    setConfirmAction({
      message:
        "Are you sure you want to delete this task? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/tasks/${task._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          navigate(`/project-management/projects/${projectId}/tasks`);
        } catch (err) {
          console.error("Error deleting task:", err);
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleStatusUpdate = async () => {
    setConfirmAction({
      message: `Confirm changing task status to "${newStatus}"?`,
      onConfirm: async () => {
        try {
          await axios.put(
            `http://localhost:5000/api/tasks/${task._id}`,
            { status: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          fetchTask();
        } catch (err) {
          console.error("Error updating status:", err);
        } finally {
          setConfirmAction(null);
          setShowStatusModal(false);
        }
      },
    });
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(
        `http://localhost:5000/api/tasks/comment/${task._id}`,
        { message: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment("");
      fetchTask(); // refresh comments
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (updatedData) => {
    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${task._id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      fetchTask();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const openAttachment = (fileUrl) => {
    // Convert relative path to full URL
    const fullUrl = fileUrl.startsWith('http') 
      ? fileUrl 
      : `http://localhost:5000${fileUrl}`;
    setCurrentAttachment(fullUrl);
    setShowAttachmentModal(true);
  };

  const openSubmission = (submission) => {
    setCurrentSubmission(submission);
    setCurrentAttachment(null); // Reset attachment when opening submission
    setShowAttachmentModal(true);
  };

  const renderMembers = () => {
    if (!task?.assignedTo?.length) return <p>No members assigned.</p>;

    return (
      <div className="d-flex align-items-center">
        {task.assignedTo.slice(0, 3).map((a, idx) => {
          const user = a.user || {};
          const initials =
            user.fullName?.split(" ").map((n) => n[0]).join("")?.slice(0, 2) ||
            user.username?.slice(0, 2)?.toUpperCase() ||
            "U";
          return (
            <div
              key={user._id || idx}
              className="rounded-circle bg-primary text-white fw-bold d-flex justify-content-center align-items-center border border-white shadow-sm"
              style={{
                width: "42px",
                height: "42px",
                marginLeft: idx === 0 ? 0 : -12,
              }}
              title={`${user.fullName || user.username} (${a.role})`}
            >
              {initials}
            </div>
          );
        })}
        {task.assignedTo.length > 3 && (
          <div
            className="rounded-circle bg-light text-dark border d-flex justify-content-center align-items-center"
            style={{ width: "42px", height: "42px", marginLeft: -12, fontSize: "0.9rem" }}
          >
            +{task.assignedTo.length - 3}
          </div>
        )}
      </div>
    );
  };

  const renderSubmissions = () => {
    if (!task?.submissions?.length) return <p className="text-muted">No submissions yet.</p>;

    return (
      <ListGroup>
        {task.submissions.map((sub, idx) => (
          <ListGroup.Item
            key={idx}
            className="d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{sub.user?.fullName || sub.user?.username || "Unknown User"}</strong>
              <br />
              <small className="text-muted">
                {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : ""}
              </small>
            </div>
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => openSubmission(sub)}
            >
              View
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  };

  if (loading || !task) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const due = new Date(task.dueDate);
  const overdue = due < new Date() && task.status !== "Approved";

  return (
    <div className="p-4 bg-light min-vh-100">
      {/* Back Button */}
      <div className="d-flex align-items-center mb-4">
        <Button
          variant="link"
          onClick={() => navigate(-1)}
          className="text-decoration-none text-dark fw-semibold"
        >
          <FaArrowLeft className="me-2" />
          Back to Tasks
        </Button>
      </div>

      {/* Task Card */}
      <Card className="shadow-sm border-0 mb-4 p-3 rounded-3">
        <Card.Body>
          <Row>
            <Col md={8}>
              <h3 className="fw-bold text-dark mb-2">{task.title}</h3>
              <p className="text-muted mb-3">{task.description}</p>
              <div className="d-flex align-items-center mb-3">
                <Badge bg={priorityColors[task.priority]} className="me-2">
                  {task.priority}
                </Badge>
                <Badge bg={statusColors[task.status]}>{task.status}</Badge>
                {overdue && (
                  <Badge bg="danger" className="ms-2">
                    <FaClock className="me-1" /> Overdue
                  </Badge>
                )}
              </div>

              {(isAssigned || canManage) && task.status !== "Approved" && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="mb-3"
                  onClick={() => setShowStatusModal(true)}
                >
                  <FaSyncAlt className="me-2" />
                  Update Status
                </Button>
              )}

              <p className="mb-1">
                <strong>Due Date:</strong>{" "}
                <span className="text-muted">
                  {task.dueDate ? due.toLocaleString() : "N/A"}
                </span>
              </p>
              <p className="mb-2">
                <strong>Assigned Members:</strong>
              </p>
              {renderMembers()}

              {/* Attachments */}
              {task.attachments?.length > 0 && (
                <div className="mt-3">
                  <strong>Attachments:</strong>
                  <ListGroup className="mt-2">
                    {task.attachments.map((file, idx) => (
                      <ListGroup.Item
                        key={idx}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <span>
                          <FaFileAlt className="me-2" />
                          {file.name || file}
                        </span>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => openAttachment(file.url || file)}
                        >
                          View
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              )}
            </Col>

            <Col md={4} className="text-md-end mt-3 mt-md-0">
              {/* Approve Button */}
              {canManage && task.status === "Subject for Approval" && (
                <Button
                  variant="success"
                  className="me-2 mb-2"
                  onClick={handleApprove}
                >
                  <FaCheckCircle className="me-1" /> Approve
                </Button>
              )}

              {/* Edit/Delete Buttons */}
              {canManage && (
                <>
                  <Button
                    variant="outline-primary"
                    className="me-2 mb-2"
                    onClick={() => setShowEditModal(true)}
                  >
                    <FaEdit className="me-1" /> Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    className="mb-2"
                    onClick={handleDelete}
                  >
                    <FaTrash className="me-1" /> Delete
                  </Button>
                </>
              )}

              {/* Submit Button */}
              {isAssigned && task.status !== "Approved" && (
                <Button
                  variant="outline-success"
                  className="mb-2"
                  onClick={() => setShowSubmitModal(true)}
                >
                  <FaCheckCircle className="me-1" /> Submit Task
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Submitted Tasks */}
      <Card className="shadow-sm border-0 rounded-3 mb-4">
        <Card.Header className="bg-white fw-semibold">
          Submitted Tasks
        </Card.Header>
        <Card.Body>{renderSubmissions()}</Card.Body>
      </Card>

      {/* Comments Section */}
      <Card className="shadow-sm border-0 rounded-3 mb-4">
        <Card.Header className="bg-white fw-semibold d-flex align-items-center">
          <FaCommentDots className="me-2 text-primary" /> Comments
        </Card.Header>
        <Card.Body>
          {task.comments?.length > 0 ? (
            <ListGroup variant="flush" className="mb-3">
              {task.comments.map((c, idx) => (
                <ListGroup.Item key={idx} className="border-0 border-bottom py-3">
                  <div className="d-flex align-items-center mb-1">
                    <FaUserCircle className="text-muted me-2" size={20} />
                    <strong>{c.user?.fullName || c.user?.username}</strong>
                  </div>
                  <div>{c.message}</div>
                  <small className="text-muted">
                    {new Date(c.createdAt).toLocaleString()}
                  </small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-muted">No comments yet.</p>
          )}

          {(isAssigned || canManage) && (
            <Form className="d-flex mt-2">
              <Form.Control
                type="text"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="shadow-sm"
              />
              <Button
                variant="primary"
                className="ms-2"
                disabled={submitting || !comment.trim()}
                onClick={handleAddComment}
              >
                {submitting ? "Posting..." : "Post"}
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>

      {/* Modals */}
      <TaskFormModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        mode="edit"
        initialData={task}
        onSubmit={handleEditSubmit}
        projectMembers={project?.members || []}
      />

      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
      />

      <SubmitTaskModal
        show={showSubmitModal}
        onHide={() => setShowSubmitModal(false)}
        taskId={task._id}
        token={token}
        projectRole={role}
        onSuccess={fetchTask}
      />

      {/* Status Modal */}
      <Modal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="">Select Status</option>
            {allowedNextStatus.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!newStatus}
            onClick={handleStatusUpdate}
          >
            Update
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Attachment / Submission Viewer Modal */}
      <Modal
        show={showAttachmentModal}
        onHide={() => {
          setShowAttachmentModal(false);
          setCurrentAttachment(null);
          setCurrentSubmission(null);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentSubmission ? "Submission Details" : "Attachment Viewer"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentSubmission ? (
            <>
              {/* Submitted By & Notes */}
              <p>
                <strong>Submitted by:</strong>{" "}
                {currentSubmission.user?.fullName || currentSubmission.user?.username || "Unknown"}
              </p>

              <p>
                <strong>Notes / Description:</strong>
              </p>
              <p className="mb-3">{currentSubmission.notes || "No description provided."}</p>

              {/* Attachments */}
              {currentSubmission.attachments?.length > 0 && (
                <div>
                  <strong>Attachments:</strong>
                  <ListGroup className="mt-2">
                    {currentSubmission.attachments.map((file, idx) => {
                      const fileUrl = file.url?.startsWith('http') 
                        ? file.url 
                        : `http://localhost:5000${file.url}`;
                      return (
                        <ListGroup.Item
                          key={file._id || idx}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <span>{file.filename || `File ${idx + 1}`}</span>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => setCurrentAttachment(fileUrl)}
                          >
                            View
                          </Button>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </div>
              )}

              {/* File Viewer */}
              {currentAttachment && (
                <div className="mt-3" style={{ height: "70vh" }}>
                  {currentAttachment.endsWith(".pdf") ? (
                    <iframe
                      src={currentAttachment}
                      title="PDF Viewer"
                      width="100%"
                      height="100%"
                    />
                  ) : currentAttachment.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                    <img
                      src={currentAttachment}
                      alt="Attachment"
                      style={{ maxWidth: "100%", maxHeight: "100%" }}
                    />
                  ) : (
                    <a href={currentAttachment} target="_blank" rel="noopener noreferrer">
                      Open File
                    </a>
                  )}
                </div>
              )}
            </>
          ) : currentAttachment ? (
            <div style={{ height: "70vh" }}>
              {currentAttachment.endsWith(".pdf") ? (
                <iframe
                  src={currentAttachment}
                  title="PDF Viewer"
                  width="100%"
                  height="100%"
                />
              ) : currentAttachment.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <img
                  src={currentAttachment}
                  alt="Attachment"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              ) : (
                <a href={currentAttachment} target="_blank" rel="noopener noreferrer">
                  Open File
                </a>
              )}
            </div>
          ) : (
            <p>No file selected.</p>
          )}
        </Modal.Body>
      </Modal>

      {/* Confirm Action */}
      <Modal show={!!confirmAction} onHide={() => setConfirmAction(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmAction?.message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmAction(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmAction?.onConfirm}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TaskDetails;