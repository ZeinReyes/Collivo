import React, { useState, useContext } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { FaPaperclip, FaCheckCircle } from "react-icons/fa";
import axios from "axios";
import { AuthContext } from "../../contexts/authContext";

const SubmitTaskModal = ({ show, onHide, taskId, token, onSuccess }) => {
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useContext(AuthContext);

  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionNotes.trim()) {
      alert("Please enter a description before submitting.");
      return;
    }
    if (attachments.length === 0) {
      alert("Please attach at least one file before submitting.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("notes", submissionNotes);
      attachments.forEach((file) => formData.append("attachments", file));

      await axios.post(
        `http://localhost:5000/api/tasks/submit/${taskId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onSuccess?.();
      onHide();
      setSubmissionNotes("");
      setAttachments([]);
    } catch (err) {
      console.error("Error submitting task:", err);
      alert(
        err.response?.data?.message || "Failed to submit task. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-semibold text-dark">
          <FaCheckCircle className="me-2 text-success" />
          Submit Task
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p className="text-muted mb-3">
            Add a description and attach at least one file before submitting.
          </p>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Description / Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Write your task explanation or details here..."
              required
              className="shadow-sm"
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="fw-semibold">
              <FaPaperclip className="me-1" />
              Attachments
            </Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={handleFileChange}
              required
            />
            {attachments.length > 0 && (
              <small className="text-muted d-block mt-1">
                Selected files: {attachments.map((f) => f.name).join(", ")}
              </small>
            )}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="success"
            disabled={loading}
            className="fw-semibold px-4"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" /> Submitting...
              </>
            ) : (
              <>
                <FaCheckCircle className="me-1" /> Submit Task
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SubmitTaskModal;
