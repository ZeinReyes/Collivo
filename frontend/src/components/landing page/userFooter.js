import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function Footer() {
  return (
    <footer
      className="text-light pt-5 pb-3"
      style={{ backgroundColor: "#00264C" }}
    >
      <div className="container">
        <div className="row gy-4 d-flex justify-content-around">
           <div className="col-md-4">
            <h4 className="fw-bold mb-3">Collivo.</h4>
            <p className="text-light opacity-75">
              Empowering teams to collaborate, organize, and deliver seamlessly
              — all in one platform built for productivity.
            </p>
          </div>

          <div className="col-6 col-md-2">
            <h6 className="fw-semibold mb-3">Company</h6>
            <ul className="list-unstyled">
              <li><a href="/about" className="text-light text-decoration-none opacity-75">About</a></li>
              <li><a href="/contact" className="text-light text-decoration-none opacity-75">Contact</a></li>
            </ul>
          </div>

          <div className="col-12 col-md-3">
            <h6 className="fw-semibold mb-3">Resources</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-light text-decoration-none opacity-75">Help Center</a></li>
              <li><a href="#" className="text-light text-decoration-none opacity-75">Terms of Service</a></li>
              <li><a href="#" className="text-light text-decoration-none opacity-75">Privacy Policy</a></li>
              <li><a href="#" className="text-light text-decoration-none opacity-75">Status</a></li>
            </ul>
          </div>
        </div>

        <hr className="border-light opacity-25 mt-5" />

        <div className="text-center mt-3">
          <p className="mb-0 opacity-75">
            © {new Date().getFullYear()} <strong>Collivo.</strong> All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
