import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getApiBaseUrl } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const googleAuthUrl = `${getApiBaseUrl()}/auth/google`;

export function SessionInvalidModal() {
  const sessionInvalidated = useAuthStore((s) => s.sessionInvalidated);
  const setSessionInvalidated = useAuthStore((s) => s.setSessionInvalidated);

  return (
    <Dialog
      open={sessionInvalidated}
      onOpenChange={(open) => {
        if (!open) setSessionInvalidated(false);
      }}
    >
      <DialogContent className="min-w-[320px] max-w-[400px] w-[90vw] p-0 m-4 shadow-sm overflow-hidden border border-slate-200">
        <div className="bg-primary text-white text-center py-2">
          <span className="small fw-semibold">Session expired</span>
        </div>
        <div className="d-flex flex-column p-4 bg-white">
          <h5 className="text-uppercase fw-semibold text-dark mb-3">
            Sign in again
          </h5>
          <p className="text-muted small mb-4">
            This account is signed in on another device. Please sign in again to
            continue using this device.
          </p>
          <a
            href={googleAuthUrl}
            className="btn btn-primary w-100 rounded-pill py-2 fw-semibold text-decoration-none text-white text-center"
          >
            Login with Google
          </a>
          <button
            type="button"
            className="btn btn-link w-100 mt-2 text-muted small"
            onClick={() => setSessionInvalidated(false)}
          >
            Dismiss
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
