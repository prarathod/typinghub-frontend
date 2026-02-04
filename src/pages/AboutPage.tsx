export const AboutPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
          About us
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          About TypingPracticeHub
        </h1>
      </div>
      <div className="mt-8 space-y-6 text-sm text-slate-700">
        <p>
          TypingPracticeHub is an online typing practice platform designed to help students improve typing speed and accuracy for competitive and professional examinations.
        </p>
        <p>
          We provide exam-oriented typing passages, structured lessons, and performance analysis tools to support students preparing for court typing tests, MPSC typing tests, and other competitive examinations.
        </p>
        <p>
          TypingPracticeHub focuses on smart practice techniques to help users build confidence, accuracy, and speed through regular typing practice in a simple and user-friendly environment.
        </p>
        <p className="font-medium text-slate-800">
          This is an independent typing practice platform. Exam categories are provided for practice guidance only. We are not affiliated with any examination authority.
        </p>
      </div>
      <div className="mt-10 space-y-3 border-t border-slate-200 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Contact / About us
        </p>
        <p className="text-sm text-slate-700">
          <a href="mailto:typingpracticehub@gmail.com" className="text-indigo-600 hover:underline">
            typingpracticehub@gmail.com
          </a>
        </p>
        <p className="text-sm text-slate-700">
          <a href="https://t.me/Helpdesktph" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
            t.me/Helpdesktph
          </a>
        </p>
      </div>
    </div>
  );
};
