import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import {
  createOrder,
  fetchProducts,
  loadRazorpayScript,
  verifyPayment
} from "@/features/payments/paymentsApi";
import { useAuthStore } from "@/stores/authStore";

type PricingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, show single-product unlock for this course. */
  productId?: string | null;
  /** When set, "View pricing" uses this callback; otherwise redirects to homepage #most-popular section. */
  onViewPricingRedirect?: () => void;
};

function formatPrice(paise: number): string {
  return `₹${paise / 100}`;
}

export function PricingDialog({ open, onOpenChange, productId, onViewPricingRedirect }: PricingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    enabled: open && Boolean(productId)
  });

  const product = productId
    ? productsData?.products?.find((p) => p.productId === productId)
    : null;

  const handleGetStarted = async () => {
    setError(null);
    setLoading(true);
    const ids = productId && product ? [productId] : [];
    if (ids.length === 0) {
      setError("Select a course to unlock.");
      setLoading(false);
      return;
    }
    try {
      const { orderId, amount, currency, keyId } = await createOrder(ids);
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
        description: product ? `Unlock: ${product.name}` : "Course unlock",
        handler: async (res: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const { user: updated } = await verifyPayment({
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature
            });
            if (updated) setUser(updated);
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

  const isSingleProduct = Boolean(productId && product);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[320px] max-w-[400px] w-[90vw] p-0 m-4 shadow-sm overflow-hidden border border-slate-200">
        <div className="bg-primary text-white text-center py-2">
          <span className="small fw-semibold">
            {isSingleProduct ? "Unlock this course" : "Get access"}
          </span>
        </div>
        <div className="d-flex flex-column p-4 bg-white">
          {isSingleProduct && product ? (
            <>
              <h5 className="text-uppercase fw-semibold text-dark mb-3">
                {product.name}
              </h5>
              <p className="text-muted small mb-3">
                This passage is part of {product.name}. Unlock full access to all passages in this course.
              </p>
              <div className="mb-4">
                <span className="display-5 fw-bold text-dark">
                  {formatPrice(product.amountPaise)}
                </span>
                <span className="text-muted small align-baseline"> one-time</span>
              </div>
            </>
          ) : (
            <>
              <h5 className="text-uppercase fw-semibold text-dark mb-3">
                Choose a plan
              </h5>
              <p className="text-muted small mb-4">
                Visit the pricing section below to pick a single course or a custom bundle. 
              </p>
            </>
          )}
          {error && (
            <div className="alert alert-danger py-2 small mb-3" role="alert">
              {error}
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary w-100 rounded-pill py-2 fw-semibold"
            onClick={
              isSingleProduct
                ? handleGetStarted
                : () => {
                    onOpenChange(false);
                    if (onViewPricingRedirect) {
                      onViewPricingRedirect();
                    } else {
                      window.location.href = "/#most-popular";
                    }
                  }
            }
            disabled={loading || (Boolean(productId) && !product)}
          >
            {loading ? "Please wait…" : isSingleProduct && product ? "Unlock for " + formatPrice(product.amountPaise) : "View pricing"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
