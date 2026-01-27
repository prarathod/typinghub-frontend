export const TermsPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
          Terms of service
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Terms and conditions
        </h1>
        <p className="text-sm text-slate-600">
          Please read these terms carefully before using TypingHub.
        </p>
      </div>
      <div className="mt-8 space-y-8 text-sm text-slate-700">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Account access
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account and for all activities that occur under your account.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Acceptable use</h2>
          <p>
            You agree not to misuse the platform, attempt unauthorized access,
            or disrupt other users. Content should be used for lawful typing
            practice only.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Payments</h2>
          <p>
            Paid plans, if offered, provide access to premium features and
            rankings. Payments are non-refundable unless required by law.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Limitation of liability
          </h2>
          <p>
            TypingHub is provided on an “as is” basis. We are not liable for any
            indirect or incidental damages arising from use of the platform.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Changes to terms
          </h2>
          <p>
            We may update these terms from time to time. Continued use of the
            service indicates acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
};
