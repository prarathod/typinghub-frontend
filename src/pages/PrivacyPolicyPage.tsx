export const PrivacyPolicyPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
          Privacy policy
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Your data, protected
        </h1>
        <p className="text-sm text-slate-600">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
      <div className="mt-8 space-y-8 text-sm text-slate-700">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Information we collect
          </h2>
          <p>
            We collect your name, email address, and profile photo when you sign
            in with Google. We also collect typing practice metrics such as WPM,
            accuracy, and session history to help you track progress.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            How we use your information
          </h2>
          <p>
            We use your information to create your account, personalize your
            practice experience, and show your progress on dashboards and
            leaderboards (if you opt in or subscribe to paid plans).
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Cookies</h2>
          <p>
            We use cookies for authentication and to keep you signed in. You can
            disable cookies in your browser, but some features may not work.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Third-party services
          </h2>
          <p>
            Google OAuth is used for authentication. Google may provide us basic
            profile information as part of the login process.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Contact and updates
          </h2>
          <p>
            If you have any questions about this policy, email us at
            help@typinghub.in. We may update this policy periodically, and the
            latest version will always be available on this page.
          </p>
        </section>
      </div>
    </div>
  );
};
