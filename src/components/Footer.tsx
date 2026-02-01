import { Link } from "react-router-dom";

import shortLogo from "@/assets/shortLogo.jpg";

const FOOTER_BG = "#1e3a5f";

export function Footer() {
  return (
    <footer className="rounded-0 shadow py-0" style={{ backgroundColor: FOOTER_BG }}>
      <div className="container">
        <div className="row align-items-start justify-content-between mb-4 mb-lg-0 pt-3">
          <div className="col-12 col-lg-auto mb-4 mb-lg-0">
            <Link to="/" className="d-flex align-items-center text-decoration-none">
              <img
                src={shortLogo}
                className="me-3"
                alt="Typing Practice Hub"
                style={{ height: "2rem", width: "auto" }}
              />
              <span className="fs-5 fw-semibold text-white">Typing Practice Hub</span>
            </Link>
          </div>
          <div className="col-12 col-lg-auto ps-0">
            <div className="row g-3 g-lg-4 text-start">
              <div className="col-4">
                <h6 className="text-uppercase fw-semibold text-white mb-2 small">Follow us</h6>
                <ul className="list-unstyled small mb-0">
                  <li className="mb-1">
                    <a
                      href="https://t.me/TypingPracticeHub"
                      target="_blank"
                      rel="noreferrer"
                      className="text-white text-opacity-75 text-decoration-none"
                      style={{ opacity: 0.9 }}
                    >
                      Telegram
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://youtube.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-white text-opacity-75 text-decoration-none"
                      style={{ opacity: 0.9 }}
                    >
                      YouTube
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-4">
                <h6 className="text-uppercase fw-semibold text-white mb-2 small">Company</h6>
                <ul className="list-unstyled small mb-0">
                  <li className="mb-1">
                    <Link to="/about" className="text-white text-opacity-75 text-decoration-none" style={{ opacity: 0.9 }}>
                      About Us
                    </Link>
                  </li>
                  <li className="mb-1">
                    <Link to="/contact" className="text-white text-opacity-75 text-decoration-none" style={{ opacity: 0.9 }}>
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy-policy" className="text-white text-opacity-75 text-decoration-none" style={{ opacity: 0.9 }}>
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="col-4">
                <h6 className="text-uppercase fw-semibold text-white mb-2 small">Legal</h6>
                <ul className="list-unstyled small mb-0">
                  <li className="mb-1">
                    <Link to="/terms" className="text-white text-opacity-75 text-decoration-none" style={{ opacity: 0.9 }}>
                      Terms &amp; Conditions
                    </Link>
                  </li>
                  <li className="mb-1">
                    <Link to="/disclaimer" className="text-white text-opacity-75 text-decoration-none" style={{ opacity: 0.9 }}>
                      Disclaimer
                    </Link>
                  </li>
                  <li>
                    <Link to="/refund-policy" className="text-white text-opacity-75 text-decoration-none" style={{ opacity: 0.9 }}>
                      Refund Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <hr className="my-4 border-white border-opacity-25" />
        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
          <span className="small text-center text-sm-start text-white text-opacity-75">
            © {new Date().getFullYear()}{" "}
            <Link to="/" className="text-white text-opacity-75 text-decoration-none" style={{ opacity: 0.9 }}>
              Typing Practice Hub™
            </Link>
            . All Rights Reserved.
          </span>
          <div className="d-flex gap-3">
            <a
              href="https://t.me/TypingPracticeHub"
              target="_blank"
              rel="noreferrer"
              className="text-white text-opacity-75 text-decoration-none"
              style={{ opacity: 0.9 }}
              aria-label="Telegram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="text-white text-opacity-75 text-decoration-none"
              style={{ opacity: 0.9 }}
              aria-label="YouTube"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
