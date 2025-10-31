import React from "react";
import { useOutletContext, NavLink } from "react-router-dom";
import { Row, Col, Card, Button, Badge } from "react-bootstrap";

const OverviewPage = () => {
  const { project, user } = useOutletContext();

  if (!project) {
    return (
      <p className="text-muted text-center mt-5">
        Loading project details...
      </p>
    );
  }

  const members = project.members || [];

  // ✅ Find the current user’s role
  const currentUserRole = members.find(
    (m) => m.user?._id === user?._id
  )?.role;

  // ✅ Role-based visibility
  const canViewEverything = ["Owner", "Admin", "Member"].includes(currentUserRole);
  const canViewLimited = ["Viewer"].includes(currentUserRole);

  // ✅ Sort members: Owner → Admin → Member → Viewer
  const sortedMembers = [...members].sort((a, b) => {
    const order = { Owner: 1, Admin: 2, Member: 3, Viewer: 4 };
    return order[a.role] - order[b.role];
  });

  // 🎨 Role-based avatar colors (consistent with MembersPage)
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "owner":
        return "#007bff"; // Blue
      case "admin":
        return "#28a745"; // Green
      case "member":
        return "#6c757d"; // Gray
      case "viewer":
        return "#ffc107"; // Yellow
      default:
        return "#adb5bd"; // Default gray
    }
  };

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
        {/* LEFT SIDE */}
        <Col lg={8}>
          <Card className="border shadow-sm" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4">
              {/* 📝 Project Description */}
              <h5 className="fw-bold mb-3">Project Description</h5>
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                {project.description || "No description provided."}
              </p>

              <hr className="my-4" />

              {/* 👥 Members Section */}
              <h5 className="fw-bold mb-4">Assignees</h5>
              <div className="d-flex flex-wrap gap-4">
                {sortedMembers.map((member, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex justify-content-center align-items-center text-white"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: getRoleColor(member.role),
                        fontSize: "18px",
                        fontWeight: "600",
                      }}
                    >
                      {member.user.fullName?.charAt(0)?.toUpperCase() ||
                        member.user.email?.charAt(0)?.toUpperCase() ||
                        "?"}
                    </div>
                    <div>
                      <p className="fw-semibold mb-0" style={{ fontSize: "14px" }}>
                        {member.user.email}{" "}
                        <span className="text-muted">
                          ({member.user.fullName || "No Name"})
                        </span>
                      </p>
                      <p
                        className="text-muted small mb-0"
                        style={{
                          textTransform: "capitalize",
                          fontWeight:
                            member.role?.toLowerCase() === "owner"
                              ? "600"
                              : "400",
                        }}
                      >
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 🧾 Activity Logs (only visible to Owner, Admin, Member) */}
              {canViewEverything && (
                <>
                  <hr className="my-4" />
                  <h5 className="fw-bold mb-3">Activity Logs</h5>

                  {project.activityLogs && project.activityLogs.length > 0 ? (
                    project.activityLogs.slice(0, 3).map((log, idx) => (
                      <div
                        key={idx}
                        className="py-2"
                        style={{ borderBottom: idx < 2 ? "1px solid #e9ecef" : "none" }}
                      >
                        <p className="mb-1" style={{ fontWeight: "500" }}>
                          {log.action}
                        </p>
                        <p className="text-muted small mb-0">
                          {log.user?.fullName || "Unknown"} •{" "}
                          {formatDate(log.createdAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted mb-0">No activity logs yet.</p>
                  )}

                  <div className="mt-3">
                    <Button
                      as={NavLink}
                      to="../activity"
                      variant="link"
                      className="p-0 text-decoration-none"
                    >
                      View All Logs
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT SIDE */}
        <Col lg={4}>
          {/* 📊 Summary */}
          <Card
            className="border shadow-sm mb-4"
            style={{ borderRadius: "12px" }}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Summary</h5>
                <Badge bg="success">ON TRACK</Badge>
              </div>
              <p className="text-muted mb-0">
                Everything is progressing smoothly.
              </p>
            </Card.Body>
          </Card>

          {/* ✅ Tasks Section (hidden for Viewer) */}
          {canViewEverything && (
            <Card
              className="border shadow-sm"
              style={{ borderRadius: "12px" }}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">Tasks</h5>
                  <Button
                    as={NavLink}
                    to="../tasks"
                    variant="link"
                    className="p-0 text-decoration-none"
                  >
                    View All
                  </Button>
                </div>

                {project.tasks && project.tasks.length > 0 ? (
                  project.tasks.slice(0, 3).map((task, idx) => (
                    <div
                      key={idx}
                      className="py-2"
                      style={{
                        borderBottom: idx < 2 ? "1px solid #e9ecef" : "none",
                      }}
                    >
                      <p className="mb-1" style={{ fontWeight: "500" }}>
                        {task.name}
                      </p>
                      <p className="text-muted small mb-0">
                        {task.assignee?.fullName || "Unassigned"} •{" "}
                        {formatDate(task.dueDate)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted mb-0">No tasks yet.</p>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default OverviewPage;
