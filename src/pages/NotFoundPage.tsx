import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center gap-3 px-4 py-5 text-center" style={{ minHeight: "60vh" }}>
      <h1 className="h3 fw-semibold text-dark">Page not found</h1>
      <p className="text-muted small mb-0">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link to="/" className="btn btn-primary">
        Go back home
      </Link>
    </div>
  );
};
