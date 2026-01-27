export const ContactPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
          Contact us
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          We are here to help
        </h1>
        <p className="text-sm text-slate-600">
          Reach out for support, feedback, or partnership enquiries. We respond
          within one business day.
        </p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Support</h2>
          <p className="mt-3 text-sm text-slate-600">
            For account or practice issues, email our support team.
          </p>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>Email: help@typinghub.in</p>
            <p>Phone: +91 90000 00000</p>
            <p>WhatsApp: +91 90000 00000</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Office hours</h2>
          <p className="mt-3 text-sm text-slate-600">
            We are available Monday to Saturday, IST.
          </p>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>Monday - Friday: 9:30 AM - 7:30 PM</p>
            <p>Saturday: 10:00 AM - 4:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>
      </div>
      <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        Prefer writing? Send your queries to{" "}
        <span className="font-semibold text-slate-900">support@typinghub.in</span>
        .
      </div>
    </div>
  );
};
