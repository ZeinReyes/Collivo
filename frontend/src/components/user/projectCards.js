import React, { useState } from "react";
import { Card, Badge, Button } from "react-bootstrap";
import { FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";
import InviteMembersModal from "../../components/user/inviteMembersModal"; // import the modal

function ProjectCard({ project, onEdit, onDelete, currentUserId }) {
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Priority colors: Low = green, Medium = yellow, High = red
  const priorityColors = {
    Low: "#198754",
    Medium: "#ffc107",
    High: "#dc3545",
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const color = priorityColors[project.priority] || "#6c757d";

  // Check if current user is the owner
  const isOwner = project.createdBy?._id === currentUserId;

  return (
    <>
      <Card
        className="mb-4 rounded-4 shadow-sm project-card"
        style={{
          minHeight: "220px",
          borderTop: `4px solid ${color}`,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
      >
        <Card.Body className="d-flex flex-column h-100">
          {/* Header: Name + Priority Badge */}
          <div className="d-flex justify-content-between align-items-start mb-2">
            <Card.Title className="mb-0" style={{ fontSize: "1.2rem", fontWeight: 600 }}>
              {project.name}
            </Card.Title>
            <Badge
              style={{
                color: "#fff",
                backgroundColor: color,
                fontWeight: "500",
                padding: "0.35em 0.6em",
              }}
            >
              {project.priority}
            </Badge>
          </div>

          {/* Description */}
          <Card.Text className="flex-grow-1 text-muted" style={{ fontSize: "0.95rem" }}>
            {project.description || "No description provided."}
          </Card.Text>

          {/* Dates */}
          <div className="mb-2">
            <small className="text-muted">
              <strong>Start:</strong> {formatDate(project.startDate)} <br />
              <strong>Due:</strong> {formatDate(project.dueDate)}
            </small>
          </div>

          {/* Owner and Action Icons */}
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <small className="text-muted" style={{ fontSize: "0.85rem" }}>
              Owner: {project.createdBy?.fullName || "Unknown"}
            </small>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => onEdit(project)}
                title="Edit Project"
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <FaEdit />
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(project._id)}
                title="Delete Project"
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <FaTrash />
              </Button>

              {/* Invite Members button only if owner */}
              {isOwner && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowInviteModal(true)}
                  title="Invite Members"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <FaUserPlus />
                </Button>
              )}
            </div>
          </div>
        </Card.Body>

        {/* Hover effect */}
        <style>{`
          .project-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          }
        `}</style>
      </Card>

      {/* Invite Members Modal */}
      {showInviteModal && (
        <InviteMembersModal
          show={showInviteModal}
          handleClose={() => setShowInviteModal(false)}
          projectId={project._id}
        />
      )}
    </>
  );
}

export default ProjectCard;
