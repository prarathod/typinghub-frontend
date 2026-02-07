export const ContactPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
          Contact us
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Contact Us
        </h1>
      </div>
      <div className="mt-8 space-y-6 text-sm text-slate-700">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Business Details</h2>
          <ul className="list-unstyled mb-0 space-y-2">
            <li><strong>Business Name:</strong> TypingPracticeHub</li>
            <li><strong>Nature of Business:</strong> Online Typing Practice Services</li>
            <li><strong>Email:</strong>{" "}
              <a href="mailto:typingpracticehub@gmail.com" className="text-indigo-600 hover:underline">
                typingpracticehub@gmail.com
              </a>
            </li>
          </ul>
        </section>
        <p>
          For any queries or support, please contact us through email. We aim to respond within 24–48 working hours.
        </p>
        <p>
          <strong>Telegram channel:</strong>{" "}
          <a
            href="https://t.me/typingpracticehub"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 hover:underline"
          >
            Join our Telegram channel
          </a>
        </p>
      </div>
    </div>
  );
};
