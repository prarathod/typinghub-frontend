import { useState } from "react";

import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import {
  createOrder,
  loadRazorpayScript,
  verifyPayment
} from "@/features/payments/paymentsApi";
import { useAuthStore } from "@/stores/authStore";

type PricingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ADVANCE_FEATURES = [
  "Unlimited typing lessons",
  "Advanced practice & mock tests",
  "Detailed analytics & insights",
  "Priority support",
  "Leaderboard access",
];

export function PricingDialog({ open, onOpenChange }: PricingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);

  const handleGetStarted = async () => {
    setError(null);
    setLoading(true);
    try {
      const { orderId, amount, currency, keyId } = await createOrder();
      await loadRazorpayScript();

      const Razorpay = window.Razorpay;
      if (!Razorpay) {
        throw new Error("Razorpay failed to load.");
      }

      const rzp = new Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: "Typing Practice Hub",
        description: "Advance plan – ₹299/mo",
        handler: async (res: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const { user } = await verifyPayment({
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature
            });
            if (user) setUser(user);
            onOpenChange(false);
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Payment verification failed."
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false)
        }
      });

      rzp.open();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not start payment. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[320px] max-w-[400px] w-[90vw] p-0 m-4 shadow-sm overflow-hidden border border-slate-200">
        <div className="bg-primary text-white text-center py-2">
          <span className="small fw-semibold">Most popular</span>
        </div>
        <div className="d-flex flex-column p-4 bg-white">
          <h5 className="text-uppercase fw-semibold text-dark mb-3">
            Advance
          </h5>
          <div className="mb-3">
            <span className="display-5 fw-bold text-dark">₹299</span>
            <span className="text-muted small align-baseline">/mo</span>
          </div>
          <p className="text-muted small mb-4">
            For serious learners and exam preparation.
          </p>
          <ul className="list-unstyled mb-4">
            {ADVANCE_FEATURES.map((feature, i) => (
              <li key={i} className="mb-2 d-flex align-items-start">
                <span className="text-success me-2">✓</span>
                <span className="small text-dark">{feature}</span>
              </li>
            ))}
          </ul>
          {error && (
            <div className="alert alert-danger py-2 small mb-3" role="alert">
              {error}
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary w-100 rounded-pill py-2 fw-semibold"
            onClick={handleGetStarted}
            disabled={loading}
          >
            {loading ? "Please wait…" : "Get started"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
