import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, NavLink, Outlet } from "react-router-dom";
import {
  Container,
  Spinner,
  Nav,
  Button,
  OverlayTrigger,
  Tooltip,
  Dropdown,
} from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import api from "../../api/api";
import InviteMembersModal from "../../components/user/inviteMembersModal";
import DeleteModal from "../../components/common/deleteModal";
import ProjectFormModal from "../../components/user/projectFormModal";
import { AuthContext } from "../../contexts/authContext";

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token, loading: authLoading } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // === Helper: Role-based avatar colors ===
  const getAvatarColor = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "owner") return "#007bff"; // blue
    if (r === "admin") return "#28a745"; // green
    return "#6c757d"; // gray default
  };

  // === FETCH PROJECT DATA ===
  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && token) {
      fetchProject();
    }
  }, [authLoading, id, token]);

  // === DELETE PROJECT ===
  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      navigate("/project-management/projects");
    } catch (err) {
      console.error("❌ Failed to delete project:", err);
    }
  };

  // === EDIT PROJECT ===
  const handleEditProject = async (formData, projectId) => {
    try {
      await api.put(`/projects/${projectId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProject();
      setShowEditModal(false);
    } catch (err) {
      console.error("❌ Failed to update project:", err);
    }
  };

  if (loading || authLoading) {
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

  // === DETERMINE USER ROLE ===
  let currentUserRole = "Guest";
  const userId = currentUser?._id || currentUser?.id;
  const ownerId = project.createdBy?._id || project.createdBy?.id;

  if (ownerId && userId && ownerId.toString() === userId.toString()) {
    currentUserRole = "Owner";
  } else {
    const currentMember = project.members?.find((m) => {
      const memberId = m.user?._id || m.user?.id;
      return memberId && memberId.toString() === userId?.toString();
    });

    if (currentMember) {
      currentUserRole = currentMember.role || "Member";
    }
  }

  // === PERMISSIONS ===
  const canInvite = ["Owner", "Admin"].includes(currentUserRole);
  const canEdit = ["Owner", "Admin"].includes(currentUserRole);
  const canDelete = currentUserRole === "Owner";

  return (
    <>
      <Container
        fluid
        className="py-4 px-md-5"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        {/* Breadcrumb */}
        <div className="mb-3 text-truncate" style={{ maxWidth: "100%" }}>
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
          {/* ✨ Truncated breadcrumb */}
          <div
            className="mb-2 text-truncate"
            style={{
              fontSize: "13px",
              color: "#6c757d",
              maxWidth: "100%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <a href="/project-management/projects">Project</a> &gt; {project.name}
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-3">
            {/* ✨ Project Name with truncation */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h1
                className="fw-bold mb-0 text-truncate"
                style={{
                  fontSize: "28px",
                  maxWidth: "550px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={project.name}
              >
                {project.name}
              </h1>

              <Dropdown>
                <Dropdown.Toggle
                  variant="link"
                  className="p-0 text-muted"
                  style={{
                    fontSize: "20px",
                    marginTop: "4px",
                    textDecoration: "none",
                    border: "none",
                    boxShadow: "none",
                  }}
                >
                  ⚙
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => setShowEditModal(true)}
                    disabled={!canEdit}
                  >
                    Edit Project
                  </Dropdown.Item>

                  <Dropdown.Divider />

                  <Dropdown.Item
                    onClick={() => setShowDeleteModal(true)}
                    className={canDelete ? "text-danger" : "text-muted"}
                    disabled={!canDelete}
                  >
                    Delete Project
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {/* Members + Invite */}
<div className="d-flex align-items-center gap-3">
  {(() => {
    // Sort members by role priority
    const sortedMembers = [...(project.members || [])].sort((a, b) => {
      const rank = { owner: 1, admin: 2, member: 3 };
      return (rank[a.role?.toLowerCase()] || 99) - (rank[b.role?.toLowerCase()] || 99);
    });

    const visibleMembers = sortedMembers.slice(0, 3);
    const extraCount = sortedMembers.length - visibleMembers.length;

    return (
      <div className="d-flex align-items-center" style={{ position: "relative" }}>
        {visibleMembers.map((member, index) => {
          const displayName = member.user.fullName || member.user.username || "Unknown";
          const firstLetter = displayName.charAt(0).toUpperCase();
          const avatarColor = getAvatarColor(member.role);
          const avatarUrl = member.avatar;

          return (
            <OverlayTrigger
              key={index}
              placement="top"
              overlay={
                <Tooltip>
                  {displayName} — {member.role || "Member"}
                </Tooltip>
              }
            >
              <div
                className="rounded-circle d-flex justify-content-center align-items-center border border-white"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: avatarUrl ? "transparent" : avatarColor,
                  backgroundImage: avatarUrl ? `url(${avatarUrl})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "15px",
                  textTransform: "uppercase",
                  marginLeft: index === 0 ? 0 : "-12px",
                  zIndex: 5 - index,
                  boxShadow: "0 0 0 1px #fff",
                }}
              >
                {!avatarUrl && firstLetter}
              </div>
            </OverlayTrigger>
          );
        })}

        {extraCount > 0 && (
          <div
            className="rounded-circle d-flex justify-content-center align-items-center bg-secondary text-white border border-white"
            style={{
              width: "40px",
              height: "40px",
              marginLeft: "-12px",
              fontWeight: "600",
              fontSize: "15px",
              zIndex: 1,
              boxShadow: "0 0 0 1px #fff",
            }}
          >
            +{extraCount}
          </div>
        )}
      </div>
    );
  })()}

  <OverlayTrigger
    placement="top"
    overlay={
      <Tooltip>
        {canInvite
          ? "Invite members"
          : "Only Owner/Admin can invite members"}
      </Tooltip>
    }
  >
    <span className="d-inline-block">
      <Button
        variant="success"
        onClick={() => canInvite && setShowInviteModal(true)}
        style={{ fontSize: "14px", padding: "8px 16px" }}
        disabled={!canInvite}
      >
        Invite Member
      </Button>
    </span>
  </OverlayTrigger>
</div>

          </div>

          <style>{`
            .custom-tab {
              color: #111 !important;
              font-weight: 500;
              border: none !important;
              border-radius: 0 !important;
              margin-right: 5px;
              background-color: transparent !important;
              transition: color 0.2s ease, border-bottom 0.2s ease;
            }
            .custom-tab:hover {
              color: #1b263b !important;
              background-color: transparent !important;
              border: none !important;
            }
            .custom-tab.active,
            .custom-tab.active:focus,
            .custom-tab.active:hover {
              border: none !important;
              border-bottom: 3px solid #1e3a8a !important;
              background-color: transparent !important;
              color: #1e3a8a !important;
            }
          `}</style>

          <Nav variant="tabs" className="mb-4 custom-nav-tabs">
            <Nav.Item>
              <Nav.Link as={NavLink} to="" end className="custom-tab">
                Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to="members" className="custom-tab">
                Members
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to="tasks" className="custom-tab">
                Tasks
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to="timeline" className="custom-tab">
                Timeline
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to="files" className="custom-tab">
                Files
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>

        <div className="fade-in">
          <Outlet context={{ project, user: currentUser, role: currentUserRole }} />
        </div>
      </Container>

      <InviteMembersModal
        show={showInviteModal}
        handleClose={() => setShowInviteModal(false)}
        projectId={id}
      />

      {showDeleteModal && (
        <DeleteModal
          title="Delete Project"
          message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteProject}
        />
      )}

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
