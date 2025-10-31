import React, { useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, Form, Button, Modal } from "react-bootstrap";
import { AuthContext } from "../../contexts/authContext";
import axios from "axios";

const MembersPage = () => {
  const { project } = useOutletContext();
  const { user, token } = useContext(AuthContext);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [members, setMembers] = useState(project?.members || []);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    memberId: null,
    newRole: "",
  });

  if (!project) {
    return <p className="text-muted text-center mt-5">Loading members...</p>;
  }

  // === Determine Project Owner ===
  let owner = project.createdBy || project.owner || null;
  if (!owner) {
    const ownerEntry =
      (project.members || []).find(
        (m) => (m.role || "").toLowerCase() === "owner"
      ) || null;
    owner = ownerEntry?.user || ownerEntry || null;
  }
  const ownerId = owner?._id || owner?.id || null;

  // === Determine Current User Role ===
  let currentRole = "member";
  if ((user?._id || user?.id) === ownerId) {
    currentRole = "owner";
  } else {
    const currentMember = (project.members || []).find(
      (m) =>
        (m.user?._id || m.user?.id || m._id || m.id) ===
        (user?._id || user?.id)
    );
    if (currentMember?.role) currentRole = currentMember.role.toLowerCase();
  }

  console.log("👤 Current User:", user?.email);
  console.log("🏗️ Project Owner:", owner?.email);
  console.log("🔍 Current Role Detected:", currentRole);

  // === Confirm Role Change ===
  const confirmRoleChange = (memberId, newRole) => {
    setConfirmModal({ show: true, memberId, newRole });
  };

  // === Proceed with Role Update ===
  const handleConfirm = async () => {
    const { memberId, newRole } = confirmModal;
    setConfirmModal({ show: false, memberId: null, newRole: "" });

    if (currentRole !== "owner") {
      console.warn("You do not have permission to change roles.");
      return;
    }

    try {
      setUpdatingRole(memberId);
      console.log(`🛠 Changing role for ${memberId} → ${newRole}`);

      const res = await axios.patch(
        `http://localhost:5000/api/projects/${project._id}/members/role`,
        { memberId, role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Role updated:", res.data);

      // Update local state
      setMembers((prev) =>
        prev.map((m) =>
          (m.user?._id || m._id) === memberId ? { ...m, role: newRole } : m
        )
      );
    } catch (err) {
      console.error("❌ Failed to update role:", err);
    } finally {
      setUpdatingRole(null);
    }
  };

  // === Get avatar color based on role ===
  const getAvatarColor = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "owner") return "#007bff";
    if (r === "admin") return "#28a745";
    return "#6c757d"; // member default
  };

  // === Normalize Members ===
  const normalizedMembers = (members || []).map((m) => {
    const userObj = m.user || m;
    const role = m.role || "Member";
    return {
      id: userObj._id || userObj.id || userObj.email,
      email: userObj.email,
      fullName: userObj.fullName || userObj.username || userObj.name,
      role,
      isOwner: (userObj._id || userObj.id) === ownerId,
      color: getAvatarColor(role),
    };
  });

  return (
    <div className="fade-in">
      <div className="row g-4">
        {/* LEFT SIDE - MEMBERS */}
        <div className="col-lg-8">
          <Card className="border shadow-sm" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4">Project Members</h5>

              {/* OWNER SECTION */}
              <div className="mb-4">
                <h6 className="fw-semibold text-muted mb-3">Project Owner</h6>
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex justify-content-center align-items-center text-white"
                    style={{
                      width: "55px",
                      height: "55px",
                      backgroundColor: getAvatarColor("owner"),
                      fontSize: "18px",
                      fontWeight: "600",
                    }}
                  >
                    {(owner?.fullName || owner?.username || "?").charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="fw-semibold mb-0" style={{ fontSize: "15px" }}>
                      {owner?.email
                        ? `${owner.email} (${owner.fullName || owner.username || "Unknown"})`
                        : owner?.fullName || owner?.username || "Unknown Owner"}
                    </p>
                    <p className="text-muted small mb-0">Owner</p>
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              {/* TEAM MEMBERS */}
              <h6 className="fw-semibold text-muted mb-3">Team Members</h6>
              {normalizedMembers.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {normalizedMembers
                    .filter((m) => !m.isOwner)
                    .map((member, idx) => (
                      <div
                        key={member.id || idx}
                        className="d-flex align-items-center justify-content-between pb-3"
                        style={{
                          borderBottom:
                            idx < normalizedMembers.length - 2
                              ? "1px solid #e9ecef"
                              : "none",
                        }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle d-flex justify-content-center align-items-center text-white"
                            style={{
                              width: "50px",
                              height: "50px",
                              backgroundColor: member.color,
                              fontSize: "18px",
                              fontWeight: "600",
                            }}
                          >
                            {(member.fullName || member.email || "?").charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="fw-semibold mb-0" style={{ fontSize: "14px" }}>
                              {`${member.email} (${member.fullName || "No Name"})`}
                            </p>
                            <p className="text-muted small mb-0">{member.role}</p>
                          </div>
                        </div>

                        {/* ROLE DROPDOWN */}
                        {currentRole === "owner" ? (
                          <Form.Select
                            size="sm"
                            style={{ width: "130px" }}
                            disabled={updatingRole === member.id || member.isOwner}
                            value={member.role}
                            onChange={(e) =>
                              confirmRoleChange(member.id, e.target.value)
                            }
                          >
                            <option>Member</option>
                            <option>Admin</option>
                          </Form.Select>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            disabled
                            style={{ width: "130px" }}
                          >
                            {member.role}
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No members have joined yet.</p>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* RIGHT SIDE - ACTIVITY LOGS */}
        <div className="col-lg-4">
          <Card className="border shadow-sm" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">Activity Logs</h5>

              {project.activityLogs && project.activityLogs.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {project.activityLogs
                    .slice()
                    .reverse()
                    .map((log, idx) => (
                      <div
                        key={idx}
                        className="pb-2"
                        style={{
                          borderBottom:
                            idx < project.activityLogs.length - 1
                              ? "1px solid #e9ecef"
                              : "none",
                        }}
                      >
                        <p
                          className="mb-1"
                          style={{ fontWeight: "500", fontSize: "14px" }}
                        >
                          {log.action}
                        </p>
                        <p className="text-muted small mb-0">
                          {log.user?.fullName ||
                            log.user?.username ||
                            "Unknown"}{" "}
                          • {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No activity yet.</p>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        show={confirmModal.show}
        onHide={() => setConfirmModal({ show: false, memberId: null, newRole: "" })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Role Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to change this member’s role to{" "}
          <strong>{confirmModal.newRole}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setConfirmModal({ show: false, memberId: null, newRole: "" })}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MembersPage;
