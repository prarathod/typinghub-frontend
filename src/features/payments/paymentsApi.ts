import { api } from "@/lib/api";
import type { User } from "@/types/auth";

export type Product = {
  productId: string;
  name: string;
  amountPaise: number;
  language?: string;
  category?: string;
};

export type BundleRule = { count: number; amountPaise: number };

export type ProductsResponse = {
  products: Product[];
  bundleRules: BundleRule[];
};

export async function fetchProducts(): Promise<ProductsResponse> {
  const { data } = await api.get<ProductsResponse>("/payments/products");
  return data;
}

export type CreateOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
};

export type VerifyPaymentResponse = {
  success: boolean;
  user: User | null;
  subscriptions?: string[];
};

export async function createOrder(productIds: string[]): Promise<CreateOrderResponse> {
  const { data } = await api.post<CreateOrderResponse>("/payments/create-order", {
    productIds
  });
  return data;
}

export async function verifyPayment(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<VerifyPaymentResponse> {
  const { data } = await api.post<VerifyPaymentResponse>("/payments/verify", params);
  if (data.user && data.subscriptions) {
    data.user.subscriptions = data.subscriptions;
  }
  return data;
}

declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      amount: number;
      currency: string;
      order_id: string;
      name: string;
      description: string;
      handler: (res: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => void;
      modal?: { ondismiss?: () => void };
    }) => { open: () => void };
  }
}

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}
