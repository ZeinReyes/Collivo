import React, { useState } from "react";
import axios from "axios";
import Navbar from "../../components/landing page/userNavbar";
import Footer from "../../components/landing page/userFooter";
import "./contactPage.css";
import { ToastManager } from "../../components/common/notificationToast";
import { useToast } from "../../hooks/useToast";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, message } = formData;

    if (!name || !email || !message) {
      addToast({
        type: "warning",
        title: "Incomplete Fields",
        message: "Please fill out all fields before submitting.",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/api/contact", formData);

      if (res.data.success) {
        addToast({
          type: "success",
          title: "Message Sent!",
          message: "Your message has been sent successfully.",
        });
        setFormData({ name: "", email: "", message: "" });
      } else {
        addToast({
          type: "error",
          title: "Failed to Send Message.",
          message: "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Server Error",
        message: "Unable to send your message at the moment.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="contact-page-wrapper">
        <Navbar />

        <section className="contact-section">
          <div className="contact-container">
            <div className="contact-info">
              <h6>Contact Us</h6>
              <h2>Get In Touch With Us</h2>
              <p>
                Have a question or want to know more about{" "}
                <span className="highlight">Collivo</span>? We’re here to
                help you make project management easier and more collaborative.
              </p>

              <div className="info-item">
                <div className="icon">📧</div>
                <div>
                  <h4>Email Address</h4>
                  <p>support@collivo.com</p>
                </div>
              </div>

              <div className="info-item">
                <div className="icon">📞</div>
                <div>
                  <h4>Phone Number</h4>
                  <p>(+63) 912 345 6789</p>
                </div>
              </div>

              <div className="info-item">
                <div className="icon">🌐</div>
                <div>
                  <h4>Social Media</h4>
                  <p>@CollivoProject on all platforms</p>
                </div>
              </div>
            </div>

            <div className="contact-form">
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
                <button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>

      <Footer />

      <ToastManager toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default ContactUs;
