import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Table,
  Button,
  Spinner,
  Alert,
  Form,
  InputGroup,
  Row,
  Col,
} from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaSearch,
  FaEllipsisH,
  FaEye,
} from "react-icons/fa";
import api from "../../api/api";
import ProjectFormModal from "../../components/user/projectFormModal";
import DeleteModal from "../../components/common/deleteModal";
import InviteMembersModal from "../../components/user/inviteMembersModal";
import { useNavigate } from "react-router-dom";

function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [projectToInvite, setProjectToInvite] = useState(null);

  // Filters & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState(10); // default 10
  const [currentPage, setCurrentPage] = useState(1);
  const [gotoPage, setGotoPage] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects/user");
      setProjects(res.data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await api.post("/projects", data);
      await fetchProjects();
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  const handleEdit = async (data, id) => {
    try {
      await api.put(`/projects/${id}`, data);
      await fetchProjects();
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      await api.delete(`/projects/${projectToDelete._id}`);
      setShowDeleteModal(false);
      setProjectToDelete(null);
      await fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };
  

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  // Get current user ID
  let currentUserId = null;
  try {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    currentUserId = storedUser?._id || storedUser?.id || null;
  } catch {
    currentUserId = null;
  }

  // Filters
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const ownerMatch = p.createdBy?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const priorityMatch = priorityFilter === "All" || p.priority === priorityFilter;
      return (nameMatch || ownerMatch) && priorityMatch;
    });
  }, [projects, searchTerm, priorityFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / rowsPerPage));
  const clampPage = (p) => Math.min(Math.max(1, p), totalPages);
  useEffect(() => {
    setCurrentPage((prev) => clampPage(prev));
  }, [filteredProjects.length, rowsPerPage]);

  const colorMap = {
    Low: "#198754",
    Medium: "#ffc107",
    High: "#dc3545",
  };

  // ensure currentPage valid when filtered changes
  useEffect(() => {
    setCurrentPage((prev) => clampPage(prev));
  }, [filteredProjects.length, rowsPerPage]); // eslint-disable-line

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, startIndex + rowsPerPage);

  // small helper to render page buttons with ellipses (similar to many dashboards)
  const renderPaginationItems = () => {
    const pages = [];
    const maxButtons = 7; // includes first/last/ellipses
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // always show first, last, current, neighbors
      const left = Math.max(2, currentPage - 1);
      const right = Math.min(totalPages - 1, currentPage + 1);

      pages.push(1);
      if (left > 2) pages.push("left-ellipsis");
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages - 1) pages.push("right-ellipsis");
      pages.push(totalPages);
    }

    return pages.map((p, idx) => {
      if (p === "left-ellipsis" || p === "right-ellipsis") {
        return (
          <Button
            key={`ell-${idx}`}
            variant="light"
            size="sm"
            className="border-0 disabled-pagination"
            disabled
            style={{ pointerEvents: "none" }}
          >
            ...
          </Button>
        );
      }
      return (
        <Button
          key={p}
          variant={p === currentPage ? "primary" : "light"}
          size="sm"
          onClick={() => setCurrentPage(p)}
          className="mx-1"
        >
          {p}
        </Button>
      );
    });
  };


  return (
    <Container fluid className="py-4 px-5">
      {/* Header */}
      <Row className="align-items-center mb-3">
        <Col md="6">
          <h3 className="mb-0">My Projects</h3>
        </Col>
        <Col md="6" className="text-end">
          <Button
            variant="primary"
            onClick={() => {
              setEditingProject(null);
              setShowModal(true);
            }}
            size="sm"
          >
            + New Project
          </Button>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="align-items-center mb-2 g-2">
        <Col md={5}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setPriorityFilter("All");
              }}
              title="Reset filters"
            >
              <FaEllipsisH />
            </Button>
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
          >
            <option value={5}>Show 5</option>
            <option value={10}>Show 10</option>
            <option value={20}>Show 20</option>
          </Form.Select>
        </Col>
        <Col md={2} className="text-end">
          <small className="text-muted">Total: {filteredProjects.length}</small>
        </Col>
      </Row>

      {/* Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <div className="table-card p-3 mb-3">
            <Table hover responsive className="mb-0 align-middle dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Priority</th>
                  <th>Owner</th>
                  <th>Start Date</th>
                  <th>Due Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  currentProjects.map((project) => {
                    const color = colorMap[project.priority] || "#6c757d";

                    const currentMember = project.members?.find(
                      (m) =>
                        m.user?._id === currentUserId ||
                        m.user?.id === currentUserId
                    );

                    let currentRole = currentMember?.role || "Viewer";
                    if (
                      project.createdBy?._id === currentUserId ||
                      project.createdBy?.id === currentUserId
                    ) {
                      currentRole = "Owner";
                    }

                    const canEdit = ["Owner", "Admin"].includes(currentRole);
                    const canDelete = ["Owner"].includes(currentRole);
                    const canInvite = ["Owner", "Admin"].includes(currentRole);

                    return (
                      <tr key={project._id}>
                        <td>
                          <div className="fw-semibold">{project.name}</div>
                          <div className="text-muted small">
                            {project.description || ""}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              backgroundColor: color,
                              color: "#fff",
                              padding: "4px 8px",
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                          >
                            {project.priority || "—"}
                          </span>
                        </td>
                        <td>
                          <div>{project.createdBy?.email || "Unknown"}</div>
                          <div className="text-muted small">
                            {project.createdBy?.fullName || ""}
                          </div>
                        </td>
                        <td>{formatDate(project.startDate)}</td>
                        <td>{formatDate(project.dueDate)}</td>

                        <td className="text-end">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() =>
                              navigate(`/project-management/projects/${project._id}`)
                            }
                            className="p-1 me-1 text-primary"
                            title="View"
                          >
                            <FaEye />
                          </Button>

                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => {
                              if (canEdit) {
                                setEditingProject(project);
                                setShowModal(true);
                              }
                            }}
                            className={`p-1 me-1 text-success ${
                              !canEdit ? "opacity-50" : ""
                            }`}
                            disabled={!canEdit}
                            title={
                              canEdit ? "Edit Project" : "Only Owner/Admin can edit"
                            }
                          >
                            <FaEdit />
                          </Button>

                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => canDelete && handleDeleteClick(project)}
                            className={`p-1 me-1 text-danger ${
                              !canDelete ? "opacity-50" : ""
                            }`}
                            disabled={!canDelete}
                            title={
                              canDelete
                                ? "Delete Project"
                                : "Only Owner can delete"
                            }
                          >
                            <FaTrash />
                          </Button>

                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => {
                              if (canInvite) {
                                setProjectToInvite(project);
                                setShowInviteModal(true);
                              }
                            }}
                            className={`p-1 text-warning ${
                              !canInvite ? "opacity-50" : ""
                            }`}
                            disabled={!canInvite}
                            title={
                              canInvite
                                ? "Invite Members"
                                : "Only Owner/Admin can invite"
                            }
                          >
                            <FaUserPlus />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
           {/* Pagination controls (centered) */}
          <Row className="align-items-center mt-3">
            <Col md={4} className="text-start">
              <small className="text-muted">
                Showing {startIndex + 1} -{" "}
                {Math.min(startIndex + rowsPerPage, filteredProjects.length)} of{" "}
                {filteredProjects.length}
              </small>
            </Col>

            <Col md={4} className="text-center">
              <div className="pagination-controls d-inline-flex align-items-center">
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setCurrentPage((p) => clampPage(p - 1))}
                  className="me-2"
                >
                  Prev
                </Button>

                {renderPaginationItems()}

                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setCurrentPage((p) => clampPage(p + 1))}
                  className="ms-2"
                >
                  Next
                </Button>
              </div>
            </Col>

            <Col md={4} className="text-end d-flex justify-content-end align-items-center gap-2">
              <small className="text-muted">Go to page</small>
              <Form.Control
                size="sm"
                style={{ width: 80 }}
                value={gotoPage}
                onChange={(e) => setGotoPage(e.target.value.replace(/\D/, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const num = Number(gotoPage || 1);
                    setCurrentPage(clampPage(num));
                    setGotoPage("");
                  }
                }}
                placeholder="1"
              />
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => {
                  const num = Number(gotoPage || 1);
                  setCurrentPage(clampPage(num));
                  setGotoPage("");
                }}
              >
                Go
              </Button>
            </Col>
          </Row>

        </>
      )}

      {/* Modals */}
      <ProjectFormModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSubmit={editingProject ? handleEdit : handleCreate}
        project={editingProject}
      />

      {showDeleteModal && (
        <DeleteModal
          title="Delete Project"
          message={`Are you sure you want to delete "${projectToDelete?.name}"?`}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {showInviteModal && (
        <InviteMembersModal
          show={showInviteModal}
          handleClose={() => setShowInviteModal(false)}
          projectId={projectToInvite?._id}
        />
      )}

      <style>{`
        .table-card {
          background: #fff;
          border-radius: 10px;
          border: 1px solid #f1f1f3;
        }
        .dashboard-table thead th {
          background: #fafafa;
          font-weight: 600;
          color: #6b6b6b;
        }
        .opacity-50 {
          opacity: 0.5;
          pointer-events: none;
        }
      `}</style>
    </Container>
  );
}

export default ProjectsPage;
