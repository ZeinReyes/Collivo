import React from "react";
import Navbar from "../../components/user/userNavbar";
import Footer from "../../components/user/userFooter";
import "./contactPage.css";

const ContactUs = () => {
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
              <form>
                <input type="text" placeholder="Your Name" />
                <input type="email" placeholder="Your Email" />
                <input type="text" placeholder="Your Phone" />
                <textarea placeholder="Your Message"></textarea>
                <button type="button">Send Message</button>
              </form>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default ContactUs;
