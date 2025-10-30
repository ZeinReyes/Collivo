// src/pages/user/ProjectsPage.js
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import api from "../../api/api";
import ProjectCard from "../../components/user/projectCards";
import ProjectFormModal from "../../components/user/projectFormModal";
import DeleteModal from "../../components/common/deleteModal";

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Fetch all projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects/user");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  // Create project
  const handleCreate = async (data) => {
    try {
      await api.post("/projects", data);
      await fetchProjects();
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  // Edit project
  const handleEdit = async (data, id) => {
    try {
      await api.put(`/projects/${id}`, data);
      await fetchProjects();
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  // Trigger delete modal
  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  // Confirm delete action
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

  // Cancel delete
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Projects</h2>
        <Button
          variant="primary"
          onClick={() => {
            setEditingProject(null);
            setShowModal(true);
          }}
        >
          + New Project
        </Button>
      </div>

      {/* Loading / Error */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : projects.length === 0 ? (
        <p className="text-center">No projects yet. Create one to get started!</p>
      ) : (
        // Grid layout for projects
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {projects.map((p) => (
            <Col key={p._id}>
              <ProjectCard
                project={p}
                onEdit={(proj) => {
                  setEditingProject(proj);
                  setShowModal(true);
                }}
                onDelete={() => handleDeleteClick(p)}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Create/Edit Modal */}
      <ProjectFormModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSubmit={editingProject ? handleEdit : handleCreate}
        project={editingProject}
      />

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteModal
          title="Delete Project"
          message={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone.`}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </Container>
  );
}

export default ProjectsPage;
