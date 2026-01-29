import { useState } from "react";

import {
  createOrder,
  loadRazorpayScript,
  verifyPayment
} from "@/features/payments/paymentsApi";
import { useAuthStore } from "@/stores/authStore";
import { getApiBaseUrl } from "@/lib/api";

function BulletFilledIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="flex-shrink-0 mt-1 me-2 text-primary" aria-hidden>
      <circle cx="8" cy="8" r="4" />
    </svg>
  );
}

function BulletOutlineIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16" className="flex-shrink-0 mt-1 me-2 text-secondary" aria-hidden>
      <circle cx="8" cy="8" r="4" />
    </svg>
  );
}

const tiers = [
  {
    name: "Basic",
    price: "Free",
    period: "",
    subtitle: "Start practicing instantly — no account needed.",
    description: "Perfect for beginners and casual practice.",
    features: [
      "5 Typing Passages FREE — No login required",
      "+5 Bonus Passages after Sign-Up",
      "5 Free Typing Lessons to build strong basics",
      "Online Typing Practice with Result Analysis",
      "Exam-Level Passages for real test preparation",
    ],
    paid: false,
  },
  {
    name: "Premium",
    price: "₹49",
    period: "/mo",
    subtitle: "Unlock your full typing potential.",
    description: "",
    features: [
      "Unlimited Typing Practice — No limits",
      "Access to All Passages in the system",
      "Full Typing Lessons Access",
      "Detailed Progress Tracking to see improvement",
      "Exam-Ready Practice for speed and accuracy",
      "Result-Oriented Passages designed for performance",
    ],
    paid: true,
    primary: true,
  },
];

export function Pricing() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleAdvanceGetStarted = () => {
    if (!user) {
      // Redirect to Google OAuth (no popup)
      window.location.href = `${getApiBaseUrl()}/auth/google`;
      return;
    }
    runPayment();
  };

  const runPayment = async () => {
    setPaymentError(null);
    setPaymentLoading(true);
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
        name: "TypingHub",
        description: "Advance plan – ₹299/mo",
        handler: async (res: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const { user: updated } = await verifyPayment({
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
            });
            if (updated) setUser(updated);
          } catch (e) {
            setPaymentError(
              e instanceof Error ? e.message : "Payment verification failed."
            );
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      });

      rzp.open();
    } catch (e) {
      setPaymentError(
        e instanceof Error ? e.message : "Could not start payment. Try again."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <>
      <section id="pricing" className="py-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-2">Pricing</h2>
            <p className="text-muted">
              Choose the plan that fits your typing practice goals.
            </p>
          </div>
          <div className="row justify-content-center g-4">
            {tiers.map((tier) => (
              <div key={tier.name} className="col-lg-5 col-xl-4">
                <div
                  className={`card h-100 shadow-sm ${
                    "primary" in tier && tier.primary ? "border-primary" : ""
                  }`}
                >
                  {"primary" in tier && tier.primary && (
                    <div className="card-header bg-primary text-white text-center py-2">
                      <span className="small fw-semibold">Most popular</span>
                    </div>
                  )}
                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="text-muted text-uppercase small fw-semibold mb-2">
                      {tier.name}
                    </h5>
                    <div className="mb-2">
                      <span className="display-5 fw-bold">{tier.price}</span>
                      <span className="text-muted">{"period" in tier ? tier.period : ""}</span>
                    </div>
                    {"subtitle" in tier && tier.subtitle && (
                      <p className="text-body small mb-3 fw-medium">{tier.subtitle}</p>
                    )}
                    {"description" in tier && tier.description && (
                      <p className="text-muted small mb-3">{tier.description}</p>
                    )}
                    <ul className="list-unstyled mb-4">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="mb-2 d-flex align-items-start">
                          {i % 2 === 0 ? <BulletFilledIcon /> : <BulletOutlineIcon />}
                          <span className="small">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {tier.paid && (
                      <div className="mt-auto">
                        {paymentError && (
                          <div
                            className="alert alert-danger py-2 small mb-3"
                            role="alert"
                          >
                            {paymentError}
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-primary w-100 rounded-pill"
                          onClick={handleAdvanceGetStarted}
                          disabled={paymentLoading}
                        >
                          {paymentLoading ? "Please wait…" : "Get started"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
