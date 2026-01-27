import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/lib/api";

type SignupDialogProps = {
  triggerLabel?: string;
};

export const SignupDialog = ({ triggerLabel = "Sign up" }: SignupDialogProps) => {
  const handleGoogleLogin = () => {
    window.location.href = `${getApiBaseUrl()}/auth/google`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start your typing journey</DialogTitle>
          <DialogDescription>
            Sign in with Google to save your progress and track rankings.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <Button className="w-full" onClick={handleGoogleLogin}>
            Continue with Google
          </Button>
          <p className="text-xs text-slate-400">
            We only access your name, email, and profile photo.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
