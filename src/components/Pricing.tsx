import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  createOrder,
  fetchProducts,
  loadRazorpayScript,
  verifyPayment,
  type Product
} from "@/features/payments/paymentsApi";
import { useAuthStore } from "@/stores/authStore";
import { getApiBaseUrl } from "@/lib/api";

const FALLBACK_PRODUCTS: Product[] = [
  { productId: "english-court", name: "English Court Typing", amountPaise: 9900 },
  { productId: "english-mpsc", name: "English MPSC Typing Exam", amountPaise: 8000 },
  { productId: "marathi-court", name: "Marathi Court Exam", amountPaise: 7000 },
  { productId: "marathi-mpsc", name: "Marathi MPSC Typing Exam", amountPaise: 6000 },
];

const FALLBACK_BUNDLE_RULES = [
  { count: 2, amountPaise: 15000 },
  { count: 3, amountPaise: 22000 },
  { count: 4, amountPaise: 28000 },
];

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

function formatPrice(paise: number): string {
  return `₹${paise / 100}`;
}

/** Split product title: first part (e.g. "English Typing") in default color, second part (e.g. "for Court Exam") in accent color. */
function getProductTitleParts(p: Product): { first: string; second: string } {
  switch (p.productId) {
    case "english-court":
      return { first: "English Typing", second: " for Court Exam" };
    case "english-mpsc":
      return { first: "English Typing", second: " for MPSC Exam" };
    case "marathi-court":
      return { first: "Marathi Typing", second: " for Court Exam" };
    case "marathi-mpsc":
      return { first: "Marathi Typing", second: " for MPSC Exam" };
    default:
      return { first: p.name, second: "" };
  }
}

const FREE_FEATURES = [
  "5 Typing Passages FREE — No login required",
  "+5 Bonus Passages after Sign-Up",
  "5 Free Typing Lessons to build strong basics",
  "Online Typing Practice with Result Analysis",
  "Exam-Level Passages for real test preparation",
];

export function Pricing() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [premiumSelected, setPremiumSelected] = useState<string | null>(null);
  const [customSelected, setCustomSelected] = useState<Set<string>>(new Set());
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    retry: 1,
    staleTime: 60_000
  });

  const products = (productsData?.products?.length ? productsData.products : FALLBACK_PRODUCTS) as Product[];
  const bundleRules = productsData?.bundleRules?.length ? productsData.bundleRules : FALLBACK_BUNDLE_RULES;

  const runPayment = async (productIds: string[]) => {
    setPaymentError(null);
    setPaymentLoading(true);
    try {
      const { orderId, amount, currency, keyId } = await createOrder(productIds);
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
        description: productIds.length === 1 ? `Course: ${products.find((p) => p.productId === productIds[0])?.name ?? ""}` : `Bundle: ${productIds.length} courses`,
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

  const handlePremiumContinue = () => {
    if (!user) {
      window.location.href = `${getApiBaseUrl()}/auth/google`;
      return;
    }
    if (!premiumSelected) return;
    runPayment([premiumSelected]);
  };

  const handleCustomContinue = () => {
    if (!user) {
      window.location.href = `${getApiBaseUrl()}/auth/google`;
      return;
    }
    const ids = [...customSelected];
    if (ids.length === 0) return;
    runPayment(ids);
  };

  const customCount = customSelected.size;
  const customFullSum = [...customSelected].reduce((sum, id) => {
    const p = products.find((x) => x.productId === id);
    return sum + (p ? p.amountPaise : 0);
  }, 0);
  const customBundleRule = bundleRules.find((r) => r.count === customCount);
  const customAmountPaise = customCount === 1 ? customFullSum : (customBundleRule?.amountPaise ?? customFullSum);
  const customDiscount = customFullSum - customAmountPaise;

  const toggleCustom = (productId: string) => {
    setCustomSelected((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  return (
    <section id="pricing" className="py-5">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="pricing-title display-6 fw-bold mb-2">Pricing</h2>
          <p className="text-muted">
            Choose the plan that fits your typing practice goals.
          </p>
        </div>
        <div className="row justify-content-center g-4">
          {/* Card 1: Free (compact) */}
          <div className="col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column p-3">
                <h5 className="text-muted text-uppercase small fw-semibold mb-1">
                  For Free User
                </h5>
                <div className="mb-1">
                  <span className="display-6 fw-bold">Free</span>
                </div>
                <p className="text-body small mb-2 fw-medium">
                  Start practicing instantly — no account needed.
                </p>
                <p className="text-muted small mb-2">Perfect for beginners and casual practice.</p>
                <ul className="list-unstyled mb-0">
                  {FREE_FEATURES.map((feature, i) => (
                    <li key={i} className="mb-1 d-flex align-items-start small">
                      {i % 2 === 0 ? <BulletFilledIcon /> : <BulletOutlineIcon />}
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Card 2: Premium – one course (stacked mini-cards) */}
          <div className="col-lg-4">
            <div className="card h-100 shadow-sm border-primary">
              <div className="card-header bg-primary text-white text-center py-2">
                <span className="small fw-semibold">Most popular</span>
              </div>
              <div className="card-body d-flex flex-column p-3">
                <h5 className="text-muted text-uppercase small fw-semibold mb-1">
                  Premium – One course
                </h5>
                <p className="text-body small mb-2 text-muted">
                  Pick any one course.
                </p>
                {productsLoading && products.length === 0 ? (
                  <div className="small text-muted">Loading…</div>
                ) : (
                  <div className="d-flex flex-column gap-2 mb-3">
                    {products.map((p) => {
                      const titleParts = getProductTitleParts(p);
                      return (
                      <div
                        key={p.productId}
                        role="button"
                        tabIndex={0}
                        onClick={() => setPremiumSelected(p.productId)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setPremiumSelected(p.productId);
                          }
                        }}
                        className={`rounded-2 border p-2 text-start text-decoration-none ${
                          premiumSelected === p.productId
                            ? "border-primary bg-primary bg-opacity-10"
                            : "border-secondary border-opacity-25 bg-light bg-opacity-50"
                        }`}
                        style={{ cursor: "pointer", transition: "border-color 0.2s, background-color 0.2s" }}
                      >
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                          <>
                            <span className="small fw-semibold text-dark">{titleParts.first}</span>
                            {titleParts.second && (
                              <span className="small fw-semibold" style={{ color: "#56B9D7" }}>{titleParts.second}</span>
                            )}
                          </>
                          <span className="small fw-bold text-primary">{formatPrice(p.amountPaise)}</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-decoration-none small text-primary mt-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedProduct(expandedProduct === p.productId ? null : p.productId);
                          }}
                          aria-expanded={expandedProduct === p.productId}
                        >
                          {expandedProduct === p.productId ? "Hide details" : "View more"}
                        </button>
                        {expandedProduct === p.productId && (
                          <p className="small text-muted mb-0 mt-1 text-primary" style={{ lineHeight: 1.4 }}>
                            All passages, full lessons access, and progress tracking tools included.
                          </p>
                        )}
                      </div>
                    );
                    })}
                  </div>
                )}
                {paymentError && (
                  <div className="alert alert-danger py-2 small mb-2" role="alert">
                    {paymentError}
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-sm w-100 rounded-pill mt-auto"
                  onClick={handlePremiumContinue}
                  disabled={paymentLoading || !premiumSelected}
                >
                  {paymentLoading ? "Please wait…" : "Continue"}
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Custom bundle (stacked mini-cards) */}
          <div className="col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column p-3">
                <h5 className="text-muted text-uppercase small fw-semibold mb-1">
                  Custom – Bundle & save
                </h5>
                <p className="text-body small mb-2 text-muted">
                  Select one or more. Discount on multiple.
                </p>
                {productsLoading && products.length === 0 ? (
                  <div className="small text-muted">Loading…</div>
                ) : (
                  <div className="d-flex flex-column gap-2 mb-3">
                    {products.map((p) => {
                      const titleParts = getProductTitleParts(p);
                      return (
                      <div
                        key={p.productId}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleCustom(p.productId)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleCustom(p.productId);
                          }
                        }}
                        className={`rounded-2 border p-2 text-start ${
                          customSelected.has(p.productId)
                            ? "border-primary bg-primary bg-opacity-10"
                            : "border-secondary border-opacity-25 bg-light bg-opacity-50"
                        }`}
                        style={{ cursor: "pointer", transition: "border-color 0.2s, background-color 0.2s" }}
                      >
                        <div className="d-flex align-items-center justify-content-between gap-2">
                          <div className="form-check mb-0 flex-grow-1">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`custom-${p.productId}`}
                              checked={customSelected.has(p.productId)}
                              onChange={() => toggleCustom(p.productId)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <label htmlFor={`custom-${p.productId}`} className="form-check-label small fw-semibold">
                              <span className="text-dark">{titleParts.first}</span>
                              {titleParts.second && (
                                <span style={{ color: "#56B9D7" }}>{titleParts.second}</span>
                              )}
                            </label>
                          </div>
                          <span className="small fw-bold text-primary">{formatPrice(p.amountPaise)}</span>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
                {customCount > 0 && (
                  <div className="small mb-2">
                    {customCount > 1 && customDiscount > 0 && (
                      <span className="text-success me-2">Save {formatPrice(customDiscount)}</span>
                    )}
                    <span className="fw-semibold">Total: {formatPrice(customAmountPaise)}</span>
                  </div>
                )}
                {paymentError && (
                  <div className="alert alert-danger py-2 small mb-2" role="alert">
                    {paymentError}
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm w-100 rounded-pill mt-auto"
                  onClick={handleCustomContinue}
                  disabled={paymentLoading || customCount === 0}
                >
                  {paymentLoading ? "Please wait…" : "Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
