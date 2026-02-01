export const DisclaimerPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
          Disclaimer
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Disclaimer
        </h1>
      </div>
      <div className="mt-8 space-y-6 text-sm text-slate-700">
        <p>
          TypingPracticeHub is an independent online typing practice platform.
        </p>
        <p>
          We are not affiliated with any government authority, court, examination board, or official organization. All typing passages and lessons are provided solely for practice and educational purposes.
        </p>
        <p>
          TypingPracticeHub does not guarantee selection, qualification, or success in any examination. Performance in actual examinations may vary based on individual preparation and exam conditions.
        </p>
        <p className="font-medium text-slate-900">
          By using this platform, users acknowledge and accept this disclaimer.
        </p>
      </div>
    </div>
  );
};
