export const PrivacyPolicyPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
          Privacy policy
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-600">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
      <div className="mt-8 space-y-8 text-sm text-slate-700">
        <p>
          TypingPracticeHub respects the privacy of its users. This Privacy Policy describes how we collect, use, and protect your information.
        </p>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Information We Collect
          </h2>
          <p>
            We may collect basic user information such as name, email address, and login details during registration. Payment-related information is processed securely through third-party payment gateways and is not stored by us.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Use of Information
          </h2>
          <p>
            Collected information is used only to provide access to typing practice services, improve user experience, and communicate important updates.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Data Security
          </h2>
          <p>
            We implement reasonable security measures to protect user data. However, no method of online transmission is 100% secure.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Third-Party Services
          </h2>
          <p>
            We may use trusted third-party services for hosting, analytics, and payment processing.
          </p>
        </section>
        <p className="font-medium text-slate-900">
          By using TypingPracticeHub, you agree to this Privacy Policy.
        </p>
      </div>
    </div>
  );
};
