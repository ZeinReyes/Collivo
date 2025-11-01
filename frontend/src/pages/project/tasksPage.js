import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Badge,
  Button,
  Card,
  Form,
  Modal,
  Spinner,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { AuthContext } from "../../contexts/authContext";
import {
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import TaskFormModal from "../../components/user/taskFormModal";

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

const ProjectTasks = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { token, user: currentUser } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("submit"); // "submit" | "edit" | "create"
  const [selectedTask, setSelectedTask] = useState(null);

  const [submissionNotes, setSubmissionNotes] = useState("");
  const [attachments, setAttachments] = useState([]);

  // === Fetch project ===
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

  // === Fetch tasks ===
  const fetchTasks = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:5000/api/tasks/project/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    if (project) fetchTasks();
  }, [project]);

  // === Determine current user role in project ===
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
  const canCreate = ["owner", "admin", "member"].includes(role);
  const isOwner = role === "owner";
  const isAdmin = role === "admin";

  const canSubmitTask = (task) => {
    if (!task || !task.assignedTo || !currentUser) return false;
    const currentId = currentUser._id || currentUser.id;
    return task.assignedTo.some((a) => {
      const assignedId = a?.user?._id || a?.user?.id || a?._id || a?.id;
      return assignedId === currentId;
    });
  };

  // === Helpers for names chips ===
  const formatChipLabel = (userObj) => {
    const full =
      userObj?.fullName || userObj?.username || userObj?.email || "User";
    const parts = full.split(" ");
    if (parts.length === 1) return full.slice(0, 12);
    return `${parts[0]} ${parts[1].charAt(0)}.`.slice(0, 14);
  };

  const sortByRoleRank = (arr) => {
    const rank = { owner: 1, admin: 2, member: 3 };
    return [...arr].sort((a, b) => {
      const ra = (a.role || "member").toLowerCase();
      const rb = (b.role || "member").toLowerCase();
      return (rank[ra] || 99) - (rank[rb] || 99);
    });
  };

  // === Handlers ===
  const handleSubmit = async (task) => {
    try {
      const formData = new FormData();
      attachments.forEach((file) => formData.append("attachments", file));
      formData.append("submissionNotes", submissionNotes);

      await axios.post(
        `http://localhost:5000/api/tasks/submit/${task._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowModal(false);
      setAttachments([]);
      setSubmissionNotes("");
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      console.error("Error submitting task:", err);
    }
  };

  const handleApprove = async (task) => {
    try {
      await axios.post(
        `http://localhost:5000/api/tasks/approve/${task._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (err) {
      console.error("Error approving task:", err);
    }
  };

  const handleCreateOrEditTask = async (form) => {
    try {
      if (modalType === "create") {
        const assignedUsers = form.assignedTo.map((id) => ({
          user: id,
          role: "Member",
        }));

        await axios.post(
          `http://localhost:5000/api/tasks`,
          {
            ...form,
            projectId,
            assignedTo: assignedUsers,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (modalType === "edit" && selectedTask) {
        await axios.put(
          `http://localhost:5000/api/tasks/${selectedTask._id}`,
          {
            ...form,
            assignedTo: form.assignedTo.map((id) => ({
              user: id,
              role: "Member",
            })),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowModal(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!canManage) return alert("You do not have permission to delete tasks.");
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // modal open helpers
  const openCreateModal = () => {
    if (!canCreate) return alert("You do not have permission to create tasks.");
    setModalType("create");
    setSelectedTask(null);
    setShowModal(true);
  };

  const openEditModal = (task) => {
    if (!canManage) return alert("You do not have permission to edit tasks.");
    setModalType("edit");
    setSelectedTask(task);
    setShowModal(true);
  };

  const openSubmitModal = (task) => {
    setSelectedTask(task);
    setSubmissionNotes("");
    setAttachments([]);
    setModalType("submit");
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Project Tasks</h3>
        {canCreate && (
          <Button variant="primary" onClick={openCreateModal}>
            <FaPlus className="me-1" /> Create Task
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <p className="text-muted">No tasks created yet.</p>
      ) : (
        <Row>
          {tasks.map((task) => {
            const due = task.dueDate ? new Date(task.dueDate) : null;
            const overdue =
              due && due < new Date() && task.status !== "Approved";
            const sortedAssignees = sortByRoleRank(task.assignedTo || []);
            const shown = sortedAssignees.slice(0, 3);
            const extra = (sortedAssignees.length || 0) - shown.length;

            return (
              <Col md={6} lg={4} key={task._id}>
                <Card className="mb-3 shadow-sm border-0 h-100">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div style={{ minWidth: 0 }}>
                        <h5
                          className="fw-semibold text-truncate"
                          title={task.title}
                        >
                          {task.title}
                        </h5>
                        <p
                          className="text-muted small mb-0 text-truncate"
                          title={task.description}
                        >
                          {task.description}
                        </p>
                      </div>
                      <Badge bg={priorityColors[task.priority] || "secondary"}>
                        {task.priority}
                      </Badge>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <Badge bg={statusColors[task.status]} className="me-2">
                        {task.status}
                      </Badge>
                      {overdue && (
                        <Badge bg="danger">
                          <FaClock className="me-1" /> Overdue
                        </Badge>
                      )}
                    </div>

                    <small className="text-muted d-block mb-3">
                      Due: {task.dueDate ? due.toLocaleString() : "N/A"}
                    </small>

                    <div className="mb-3">
                      {sortedAssignees.length > 0 ? (
                        <div
                          className="d-flex align-items-center"
                          style={{ gap: 6, flexWrap: "nowrap" }}
                        >
                          {shown.map((a, i) => {
                            const u = a.user || {};
                            const label = formatChipLabel(u);
                            const full =
                              u.fullName || u.username || u.email || "User";
                            return (
                              <OverlayTrigger
                                key={i}
                                placement="top"
                                overlay={
                                  <Tooltip>{`${full} — ${
                                    a.role || "Member"
                                  }`}</Tooltip>
                                }
                              >
                                <div
                                  style={{
                                    background: "#f1f3f5",
                                    border: "1px solid #e9ecef",
                                    padding: "6px 10px",
                                    borderRadius: 18,
                                    marginLeft: i === 0 ? 0 : -10,
                                    zIndex: 10 - i,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: "default",
                                  }}
                                >
                                  {label}
                                </div>
                              </OverlayTrigger>
                            );
                          })}
                          {extra > 0 && (
                            <div
                              className="d-flex justify-content-center align-items-center"
                              style={{
                                background: "#e9ecef",
                                padding: "6px 10px",
                                borderRadius: 18,
                                marginLeft: -10,
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              +{extra}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted small">No assignees</div>
                      )}
                    </div>

                    <div className="mt-auto d-flex justify-content-end">
                      <OverlayTrigger overlay={<Tooltip>Open task</Tooltip>}>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={() =>
                            navigate(
                              `/project-management/projects/${projectId}/tasks/${task._id}`
                            )
                          }
                        >
                          <FaEye />
                        </Button>
                      </OverlayTrigger>

                      {canSubmitTask(task) && task.status !== "Approved" && (
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => openSubmitModal(task)}
                        >
                          Submit
                        </Button>
                      )}

                      {isOwner || isAdmin && task.status === "Subject for Approval" && (
                        <OverlayTrigger overlay={<Tooltip>Approve</Tooltip>}>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleApprove(task)}
                          >
                            <FaCheckCircle />
                          </Button>
                        </OverlayTrigger>
                      )}

                      {canManage && (
                        <>
                          <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => openEditModal(task)}
                            >
                              <FaEdit />
                            </Button>
                          </OverlayTrigger>

                          <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteTask(task._id)}
                            >
                              <FaTrash />
                            </Button>
                          </OverlayTrigger>
                        </>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* === Modal === */}
      {modalType === "submit" ? (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Submit Task: {selectedTask?.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Submission Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Attachments</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={(e) => setAttachments(Array.from(e.target.files))}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSubmit(selectedTask)}
            >
              Submit Task
            </Button>
          </Modal.Footer>
        </Modal>
      ) : (
        <TaskFormModal
          show={showModal}
          onHide={() => setShowModal(false)}
          mode={modalType}
          initialData={selectedTask || {}}
          onSubmit={handleCreateOrEditTask}
          projectMembers={project?.members || []}
        />
      )}
    </div>
  );
};

export default ProjectTasks;
