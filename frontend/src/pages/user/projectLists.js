// src/pages/user/ProjectsPage.js
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

  // Placeholder date range state (UI only; hook up to backend if needed)
  const [dateRangeLabel] = useState("Feb 24th, 2023 - Mar 15, 2023");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects/user");
      // expecting res.data to be array
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

  // ownership: attempt to infer current user id from localStorage or project context
  let currentUserId = null;
  try {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    currentUserId = storedUser?._id || storedUser?.id || null;
  } catch {
    currentUserId = null;
  }

  // Filtered projects (search + priority)
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const nameMatches = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const ownerNameMatches =
        p.createdBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
      const searchMatch = searchTerm.trim() === "" || nameMatches || ownerNameMatches;

      const priorityMatch = priorityFilter === "All" || p.priority === priorityFilter;

      return searchMatch && priorityMatch;
    });
  }, [projects, searchTerm, priorityFilter]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / rowsPerPage));
  const clampPage = (p) => Math.min(Math.max(1, p), totalPages);

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

  const colorMap = {
    Low: "#198754",
    Medium: "#ffc107",
    High: "#dc3545",
  };

  return (
    <Container fluid className="py-4 px-5">
      {/* Top controls */}
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

      {/* Filters Bar (search, priority, show rows) */}
      <Row className="align-items-center mb-2 g-2">
        <Col md={5}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name or owner..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setPriorityFilter("All");
                setRowsPerPage(10);
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
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Form.Select>
        </Col>

        <Col md={2} className="text-end">
          <Form.Select
            value={rowsPerPage}
            onChange={(e) => {
              const n = Number(e.target.value);
              setRowsPerPage(n);
              setCurrentPage(1);
            }}
          >
            <option value={5}>Show 5 rows</option>
            <option value={10}>Show 10 rows</option>
            <option value={20}>Show 20 rows</option>
            <option value={50}>Show 50 rows</option>
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
          <div className="table-card p-3 mb-2">
            <Table hover responsive className="mb-0 align-middle dashboard-table">
              <thead>
                <tr>
                  <th style={{ width: "25%" }}>Name</th>
                  <th style={{ width: "12%" }}>Priority</th>
                  <th style={{ width: "20%" }}>Owner</th>
                  <th style={{ width: "13%" }}>Start Date</th>
                  <th style={{ width: "13%" }}>Due Date</th>
                  <th style={{ width: "15%" }} className="text-end">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentProjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No matching projects
                    </td>
                  </tr>
                ) : (
                  currentProjects.map((project) => {
                    const color = colorMap[project.priority] || "#6c757d";
                    const isOwner = project.createdBy?._id === currentUserId;

                    return (
                      <tr key={project._id} className="table-row">
                        <td className="py-3">
                          <div className="fw-semibold">{project.name}</div>
                          <div className="text-muted small">{project.description || ""}</div>
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
                          <div>{project.createdBy?.fullName || "Unknown"}</div>
                          <div className="text-muted small">{project.createdBy?.email || ""}</div>
                        </td>

                        <td>{formatDate(project.startDate)}</td>
                        <td>{formatDate(project.dueDate)}</td>

                        <td className="text-end">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => navigate(`/project-management/projects/${project._id}`)}
                            className="p-1 me-1 text-primary"
                            title="View"
                          >
                            <FaEye />
                          </Button>

                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => {
                              setEditingProject(project);
                              setShowModal(true);
                            }}
                            className="p-1 me-1 text-success"
                            title="Edit"
                          >
                            <FaEdit />
                          </Button>

                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleDeleteClick(project)}
                            className="p-1 me-1 text-danger"
                            title="Delete"
                          >
                            <FaTrash />
                          </Button>

                          {isOwner && (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => {
                                setProjectToInvite(project);
                                setShowInviteModal(true);
                              }}
                              className="p-1 text-warning"
                              title="Invite"
                            >
                              <FaUserPlus />
                            </Button>
                          )}
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
          message={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone.`}
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

      {/* Inline CSS to emulate the clean dashboard style */}
      <style>{`
        .table-card {
          background: #fff;
          border-radius: 10px;
          border: 1px solid #f1f1f3;
        }
        .dashboard-table thead th {
          background: #fafafa;
          color: #6b6b6b;
          font-weight: 600;
          border-bottom: 1px solid #f1f1f3;
          padding: 12px;
        }
        .dashboard-table tbody tr {
          border-bottom: 1px solid #f4f4f6;
        }
        .dashboard-table tbody tr.table-row:hover {
          background: #fbfbfc;
        }
        .dashboard-table td {
          vertical-align: middle;
          padding: 12px;
          background: transparent;
        }
        .disabled-pagination {
          background: transparent;
          color: #9aa0a6;
        }
        /* subtle small text style */
        .table-card .small { font-size: 0.78rem; }
      `}</style>
    </Container>
  );
}

export default ProjectsPage;
