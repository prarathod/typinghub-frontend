import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

function getBackUrl(): string {
  // React Router v6 stores navigation state in window.history.state.usr
  const state = (window.history.state as { usr?: { backUrl?: string } } | null)?.usr;
  return state?.backUrl ?? "/practice/lessons";
}

function backLabel(backUrl: string): string {
  if (backUrl.includes("court-exam")) return "← Back to Court Typing";
  if (backUrl.includes("mpsc")) return "← Back to MPSC";
  return "← Back to Lessons";
}

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
      const backUrl = getBackUrl();
      return (
        <main className="container py-5" style={{ backgroundColor: "#fff", minHeight: "80vh" }}>
          <div className="alert alert-danger">
            Something went wrong loading this passage. Please try again or choose another one.
            {isDev && this.state.error && (
              <pre className="mt-2 mb-0 small text-start" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {this.state.error.message}
              </pre>
            )}
          </div>
          <Link to={backUrl} className="btn btn-outline-primary mt-2">
            {backLabel(backUrl)}
          </Link>
        </main>
      );
    }
    return this.props.children;
  }
}
