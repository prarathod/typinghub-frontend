import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class TypingPageErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Typing page error:", error.message, error.stack, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      return (
        <main className="container py-5" style={{ backgroundColor: "#fff", minHeight: "80vh" }}>
          <div className="alert alert-danger">
            Something went wrong loading this lesson. Please try again or choose another lesson.
            {isDev && this.state.error && (
              <pre className="mt-2 mb-0 small text-start" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {this.state.error.message}
              </pre>
            )}
          </div>
          <Link to="/practice/lessons" className="btn btn-outline-primary mt-2">
            ← Back to lessons
          </Link>
        </main>
      );
    }
    return this.props.children;
  }
}
