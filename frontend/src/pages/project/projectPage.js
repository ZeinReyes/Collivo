import React, { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink, Outlet } from "react-router-dom";
import { Container, Spinner, Nav, Button, OverlayTrigger, Tooltip, Dropdown } from "react-bootstrap";
import { FaArrowLeft, FaEllipsisV } from "react-icons/fa";
import api from "../../api/api";
import InviteMembersModal from "../../components/user/inviteMembersModal";
import DeleteModal from "../../components/common/deleteModal";
import ProjectFormModal from "../../components/user/projectFormModal";

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      setShowDeleteModal(false);
      navigate("/project-management/projects");
    } catch (err) {
      console.error("❌ Failed to delete project:", err);
    }
  };

  const handleEditProject = async (formData, projectId) => {
    try {
      await api.put(`/projects/${projectId}`, formData);
      await fetchProject(); // Refresh project data
      setShowEditModal(false);
    } catch (err) {
      console.error("❌ Failed to update project:", err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <Container className="py-5 text-center">
        <h5 className="text-muted mb-3">Project not found</h5>
        <Button variant="outline-primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container fluid className="py-4 px-md-5" style={{ backgroundColor: "#f8f9fa" }}>
        {/* Breadcrumb */}
        <div className="mb-3">
          <Button
            variant="link"
            className="p-0 text-decoration-none text-primary d-flex align-items-center gap-2"
            onClick={() => navigate("/project-management/projects")}
            style={{ fontSize: "14px" }}
          >
            <FaArrowLeft size={12} /> Back to Projects
          </Button>
        </div>
        <div className="main-header bg-white pt-3 px-3 rounded">
          <div className="mb-2" style={{ fontSize: "13px", color: "#6c757d" }}>
            <a href="/project-management/projects">Project</a> &gt; {project.name}
          </div>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-3">
            <div className="d-flex align-items-center gap-2">
              <h1 className="fw-bold mb-0" style={{ fontSize: "32px" }}>{project.name}</h1>
              <Dropdown>
                <Dropdown.Toggle 
                  variant="link" 
                  className="p-0 text-muted"
                  style={{ 
                    fontSize: "20px", 
                    marginTop: "4px",
                    textDecoration: "none",
                    border: "none",
                    boxShadow: "none"
                  }}
                >
                  ⚙
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setShowEditModal(true)}>
                    Edit Project
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item 
                    onClick={() => setShowDeleteModal(true)}
                    className="text-danger"
                  >
                    Delete Project
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            <div className="d-flex align-items-center gap-2">
              {project.members?.map((member, idx) => (
                <OverlayTrigger
                  key={idx}
                  placement="top"
                  overlay={<Tooltip>{member.fullName || member.username}</Tooltip>}
                >
                  <div
                    className="rounded-circle d-flex justify-content-center align-items-center text-white"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: member.avatar ? "transparent" : "#1e3a8a",
                      backgroundImage: member.avatar ? `url(${member.avatar})` : "none",
                      backgroundSize: "cover",
                      fontWeight: "600",
                      fontSize: "14px",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      border: "2px solid #fff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    {!member.avatar && (member.fullName?.charAt(0) || member.username?.charAt(0))}
                  </div>
                </OverlayTrigger>
              ))}
              <Button 
                variant="success" 
                onClick={() => setShowInviteModal(true)}
                style={{ fontSize: "14px", padding: "8px 16px" }}
              >
                Invite Member
              </Button>
            </div>
          </div>

          <style>{`
            .custom-nav-tabs .nav-link {
              border: none !important;
              border-bottom: 2px solid transparent !important;
              background: transparent !important;
              color: #495057 !important;
              font-size: 14px;
              padding: 12px 20px;
            }
            .custom-nav-tabs .nav-link.active {
              border-bottom: 2px solid #1e3a8a !important;
              color: #1e3a8a !important;
              font-weight: 700 !important;
            }
          `}</style>
          <Nav variant="tabs" className="mb-4 border-bottom custom-nav-tabs" style={{ borderColor: "#dee2e6" }}>
            <Nav.Item>
              <Nav.Link as={NavLink} to="" end>
                Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to="members">
                Members
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to="tasks">
                Tasks
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to="timeline">
                Timeline
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to="files">
                Files
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>

        {/* Nested Routes */}
        <div className="fade-in">
          <Outlet context={{ project }} />
        </div>
      </Container>

      {/* Invite Members Modal */}
      <InviteMembersModal 
        show={showInviteModal}
        handleClose={() => setShowInviteModal(false)}
        projectId={id}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteModal
          title="Delete Project"
          message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteProject}
        />
      )}

      {/* Edit Project Modal */}
      <ProjectFormModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        onSubmit={handleEditProject}
        project={project}
      />
    </>
  );
};

export default ProjectPage;