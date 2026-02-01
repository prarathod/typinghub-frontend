import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getApiBaseUrl } from "@/lib/api";

type LoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const googleAuthUrl = `${getApiBaseUrl()}/auth/google`;

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[320px] max-w-[400px] w-[90vw] p-0 m-4 shadow-sm overflow-hidden border border-slate-200">
        <div className="bg-primary text-white text-center py-2">
          <span className="small fw-semibold">
            Sign In / Sign Up using Google
          </span>
        </div>
        <div className="d-flex flex-column p-4 bg-white">
          <h5 className="text-uppercase fw-semibold text-dark mb-3">
            Sign in
          </h5>
          <p className="text-muted small mb-4">
            Sign in with your Google account to access paid lessons, track your progress, and unlock all courses.
          </p>
          <a
            href={googleAuthUrl}
            className="btn btn-primary w-100 rounded-pill py-2 fw-semibold text-decoration-none text-white text-center"
          >
            Login with Google
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
