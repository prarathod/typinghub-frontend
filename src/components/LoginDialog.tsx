import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { getApiBaseUrl } from "@/lib/api";

type LoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const handleGoogleLogin = () => {
    window.location.href = `${getApiBaseUrl()}/auth/google`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[320px] max-w-[400px] w-[90vw] p-8 m-4 shadow-sm">
        <DialogHeader className="mb-2">
          <DialogTitle>Sign in to continue</DialogTitle>
          <DialogDescription>
            This passage is for paid members. Sign in with Google to access paid
            content and track your progress.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-5">
          <button
            type="button"
            className="btn btn-primary w-100 rounded-pill py-2"
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
