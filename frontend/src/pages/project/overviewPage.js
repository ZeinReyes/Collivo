import React from "react";
import { useOutletContext, NavLink } from "react-router-dom";
import { Row, Col, Card, Button, Badge } from "react-bootstrap";
import {
  FaUser,
  FaCalendarAlt,
  FaTasks,
  FaUsers,
  FaUpload,
  FaPlus,
} from "react-icons/fa";

const OverviewPage = () => {
  const { project } = useOutletContext();

  if (!project) {
    return <p className="text-muted text-center mt-5">Loading project details...</p>;
  }

  const owner = project.createdBy || {};
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  return (
    <div className="fade-in">
      <Row className="g-4">
        {/* === LEFT SIDE: MAIN CONTENT === */}
        <Col lg={8}>
          {/* Project Description & Assignees - Combined Card */}
          <Card className="border shadow-sm" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4">
              {/* Project Description */}
              <h5 className="fw-bold mb-3" style={{ fontSize: "18px" }}>Project Description</h5>
              <p className="text-muted mb-0" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                {project.description ||
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit."}
              </p>

              {/* Divider Line */}
              <hr className="my-4" style={{ borderColor: "#111" }} />

              {/* Assignees */}
              <h5 className="fw-bold mb-4" style={{ fontSize: "18px" }}>Assignee</h5>
              <div className="d-flex flex-wrap gap-4">
                {/* Project Owner */}
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex justify-content-center align-items-center text-white"
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: "#e0e0e0",
                      fontSize: "18px",
                      fontWeight: "600",
                    }}
                  >
                    {owner.fullName?.charAt(0) || owner.username?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="fw-semibold mb-0" style={{ fontSize: "14px" }}>
                      {owner.fullName || "Member Name"}
                    </p>
                    <p className="text-muted small mb-0" style={{ fontSize: "12px" }}>
                      Project Owner
                    </p>
                  </div>
                </div>

                {/* First Member */}
                {project.members && project.members[0] && (
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex justify-content-center align-items-center text-white"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "#e0e0e0",
                        fontSize: "18px",
                        fontWeight: "600",
                      }}
                    >
                      {project.members[0].fullName?.charAt(0) || 
                       project.members[0].username?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="fw-semibold mb-0" style={{ fontSize: "14px" }}>
                        {project.members[0].fullName || "Member Name"}
                      </p>
                      <p className="text-muted small mb-0" style={{ fontSize: "12px" }}>
                        {project.members[0].role || "Role"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* === RIGHT SIDE: SUMMARY PANEL === */}
        <Col lg={4}>
          {/* Summary Card */}
          <Card className="border shadow-sm mb-4" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ fontSize: "18px" }}>Summary</h5>
                <Badge 
                  bg="success" 
                  style={{ 
                    fontSize: "11px", 
                    padding: "4px 10px",
                    fontWeight: "600"
                  }}
                >
                  ON TRACK
                </Badge>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: "13px", lineHeight: "1.6" }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </Card.Body>
          </Card>

          {/* Tasks Card */}
          <Card className="border shadow-sm" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ fontSize: "18px" }}>Tasks</h5>
                <Button 
                  as={NavLink} 
                  to="../tasks" 
                  variant="link" 
                  className="text-decoration-none p-0"
                  style={{ fontSize: "13px" }}
                >
                  View All
                </Button>
              </div>
              
              {project.tasks && project.tasks.length > 0 ? (
                <div>
                  {project.tasks.slice(0, 3).map((task, idx) => (
                    <div 
                      key={idx} 
                      className="py-2"
                      style={{ 
                        borderBottom: idx < 2 ? "1px solid #e9ecef" : "none" 
                      }}
                    >
                      <p className="mb-1" style={{ fontSize: "14px", fontWeight: "500" }}>
                        {task.name}
                      </p>
                      <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                        {task.assignee?.fullName || "Unassigned"} • {formatDate(task.dueDate)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  No tasks yet. Create your first task to get started.
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OverviewPage;