import { useState } from "react";

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "What is TypingPracticeHub?",
    answer:
      "TypingPracticeHub is an online typing practice platform for students preparing for court typing tests, MPSC typing exams, and other competitive examinations. We offer structured lessons, exam-level passages, and result analysis to improve speed and accuracy."
  },
  {
    question: "Do I need to sign up to practice?",
    answer:
      "No. You can practice 5 typing passages and 5 free lessons without creating an account. Sign up to unlock 5 bonus passages and to save your progress, leaderboard standing, and submission history."
  },
  {
    question: "What are the Premium and Custom plans?",
    answer:
      "Premium lets you pick one course (e.g. English Typing for Court Exam) at ₹49/plan. Custom lets you select multiple courses and get a discount. Both give full access to all passages and lessons in the selected course(s)."
  },
  {
    question: "How is my typing speed measured?",
    answer:
      "We measure words per minute (WPM) and keystrokes per minute (KPM) based on correct words typed and the time taken. Accuracy is calculated from correct vs incorrect words. Results are shown after you submit a passage."
  },
  {
    question: "Can I practice for Court and MPSC exams?",
    answer:
      "Yes. We have dedicated sections for English Typing for Court Exam, English Typing for MPSC Exam, Marathi Typing for Court Exam, and Marathi Typing for MPSC Exam. Passages are designed to match exam-level practice."
  },
  {
    question: "How do I get access to paid lessons?",
    answer:
      "Sign in with Google, then go to Pricing (or click a paid lesson). Choose Premium (one course) or Custom (multiple courses), complete payment via Razorpay, and you’ll get immediate access to the purchased course(s)."
  },
  {
    question: "Where can I see my past results?",
    answer:
      "After signing in, open any passage you’ve attempted and use “View Details” in the results modal to see leaderboard, your rank, and submission history for that passage."
  },
  {
    question: "Who can I contact for support?",
    answer:
      "Email us at typingpracticehub@gmail.com or join our Telegram channel. We aim to respond within 24–48 working hours."
  }
];

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-slate-200 rounded-3 overflow-hidden mb-2">
      <button
        type="button"
        className="w-100 text-start d-flex align-items-center justify-content-between gap-3 p-4 bg-white border-0 fw-semibold text-dark"
        style={{ fontSize: "1rem" }}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question.slice(0, 20).replace(/\s/g, "-")}`}
        id={`faq-question-${question.slice(0, 20).replace(/\s/g, "-")}`}
      >
        <span>{question}</span>
        <span className="flex-shrink-0" aria-hidden>
          {isOpen ? "−" : "+"}
        </span>
      </button>
      <div
        id={`faq-answer-${question.slice(0, 20).replace(/\s/g, "-")}`}
        role="region"
        aria-labelledby={`faq-question-${question.slice(0, 20).replace(/\s/g, "-")}`}
        className={isOpen ? "d-block" : "d-none"}
      >
        <div className="px-4 pb-4 pt-0 text-slate-700" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
          {answer}
        </div>
      </div>
    </div>
  );
}

export function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="container py-5">
      <div className="mx-auto" style={{ maxWidth: "42rem" }}>
        <div className="text-center mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500 mb-2">
            FAQs
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-600" style={{ fontSize: "1.05rem" }}>
            Common questions about typing practice, plans, and support.
          </p>
        </div>

        <section className="mt-4" aria-label="FAQ list">
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex((prev) => (prev === index ? null : index))}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
