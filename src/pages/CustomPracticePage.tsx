import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { hasAnyPaidAccess } from "@/lib/access";
import { LoginDialog } from "@/components/LoginDialog";
import { PricingDialog } from "@/components/PricingDialog";

type Layout = "show" | "hide";

const LAYOUT_OPTIONS: { value: Layout; label: string; desc: string }[] = [
  {
    value: "show",
    label: "Show passage",
    desc: "Passage stays visible while you type — same as MPSC practice.",
  },
  {
    value: "hide",
    label: "Hide passage",
    desc: "Read the passage first, then type on a blank A4 page — same as Court exam practice.",
  },
];

const TIMER_OPTIONS = [
  { value: 5 * 60, label: "5 minutes" },
  { value: 10 * 60, label: "10 minutes" },
  { value: 15 * 60, label: "15 minutes" },
  { value: 30 * 60, label: "30 minutes" },
  { value: 0, label: "No limit (count up)" },
] as const;

async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(pageText);
  }
  return pages.join("\n\n").replace(/\s+/g, " ").trim();
}

export function CustomPracticePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteText, setPasteText] = useState("");
  const [title, setTitle] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(10 * 60);
  const [layout, setLayout] = useState<Layout>("show");
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [inputMode, setInputMode] = useState<"paste" | "pdf">("paste");

  const isPaid = hasAnyPaidAccess(user);

  if (!user) {
    return (
      <>
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
        <main className="container py-5 d-flex flex-column align-items-center justify-content-center" style={{ maxWidth: "520px", minHeight: "60vh" }}>
          <div className="text-center mb-4">
            <span className="badge bg-warning text-dark mb-3 px-3 py-2 rounded-pill fw-semibold" style={{ fontSize: "0.8rem" }}>Pro Feature</span>
            <h1 className="display-6 fw-bold text-dark mb-2">Custom Practice</h1>
            <p className="text-secondary mb-4">
              Sign in to access Custom Practice — upload a PDF or paste any paragraph and start typing.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg rounded-pill px-5"
              onClick={() => setShowLoginDialog(true)}
            >
              Sign in to continue
            </button>
          </div>
        </main>
      </>
    );
  }

  if (!isPaid) {
    return (
      <>
        <PricingDialog open={showPricingDialog} onOpenChange={setShowPricingDialog} />
        <main className="container py-5 d-flex flex-column align-items-center justify-content-center" style={{ maxWidth: "520px", minHeight: "60vh" }}>
          <div className="text-center mb-4">
            <span className="badge bg-warning text-dark mb-3 px-3 py-2 rounded-pill fw-semibold" style={{ fontSize: "0.8rem" }}>Pro Feature</span>
            <h1 className="display-6 fw-bold text-dark mb-2">Custom Practice</h1>
            <p className="text-secondary mb-4">
              Custom Practice is available exclusively for paid subscribers. Upgrade to upload your own PDFs or paste any text and practice at your own pace.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg rounded-pill px-5"
              onClick={() => setShowPricingDialog(true)}
            >
              Upgrade to unlock
            </button>
            <div className="mt-3">
              <a
                href="/practice"
                className="text-secondary text-decoration-none small"
                onClick={(e) => { e.preventDefault(); navigate("/practice"); }}
              >
                ← Back to practice
              </a>
            </div>
          </div>
        </main>
      </>
    );
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setPdfError("Please upload a valid PDF file.");
      return;
    }
    setPdfError(null);
    setIsPdfLoading(true);
    try {
      const text = await extractTextFromPdf(file);
      if (!text.trim()) {
        setPdfError("Could not extract text from this PDF. Try pasting the text instead.");
        setPdfFileName(null);
      } else {
        setPasteText(text);
        setPdfFileName(file.name);
        if (!title) setTitle(file.name.replace(/\.pdf$/i, ""));
      }
    } catch {
      setPdfError("Failed to read PDF. Try pasting the text instead.");
      setPdfFileName(null);
    } finally {
      setIsPdfLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleStart = () => {
    const text = pasteText.trim();
    if (!text) return;
    navigate("/practice/custom/typing", {
      state: {
        text,
        title: title.trim() || "Custom Practice",
        timerSeconds,
        layout,
      },
    });
  };

  const canStart = pasteText.trim().length > 0;

  return (
    <main className="container py-5" style={{ maxWidth: "760px" }}>
      <div className="mb-4">
        <a
          href="/practice"
          className="text-primary text-decoration-none small"
          onClick={(e) => { e.preventDefault(); navigate("/practice"); }}
        >
          ← Back to practice
        </a>
      </div>

      <div className="text-center mb-5">
        <h1 className="display-6 fw-bold text-dark mb-2">Custom Practice</h1>
        <p className="text-secondary mb-0">
          Upload a PDF or paste any paragraph to practice typing at your own pace.
        </p>
      </div>

      <div className="card border shadow-sm rounded-3 p-4 mb-4">
        <h2 className="h6 fw-semibold mb-3">Session title (optional)</h2>
        <input
          type="text"
          className="form-control"
          placeholder="e.g. Chapter 1 Notes"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
        />
      </div>

      <div className="card border shadow-sm rounded-3 p-4 mb-4">
        <h2 className="h6 fw-semibold mb-3">Paragraph source</h2>

        {/* Toggle buttons */}
        <div className="btn-group mb-3 w-100" role="group">
          <button
            type="button"
            className={`btn ${inputMode === "paste" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setInputMode("paste")}
          >
            Paste text
          </button>
          <button
            type="button"
            className={`btn ${inputMode === "pdf" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setInputMode("pdf")}
          >
            Upload PDF
          </button>
        </div>

        {inputMode === "paste" && (
          <textarea
            className="form-control"
            rows={8}
            placeholder="Paste or type your paragraph here..."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
        )}

        {inputMode === "pdf" && (
          <div>
            <div
              className="border rounded-3 p-4 text-center"
              style={{ backgroundColor: "#f8f9fa", cursor: "pointer" }}
              onClick={() => fileInputRef.current?.click()}
            >
              {isPdfLoading ? (
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  <span className="small text-secondary">Extracting text from PDF…</span>
                </div>
              ) : pdfFileName ? (
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#198754" viewBox="0 0 16 16" className="mb-2" aria-hidden>
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
                  <p className="mb-0 small fw-semibold text-success">{pdfFileName}</p>
                  <p className="mb-0 small text-secondary mt-1">Click to upload a different PDF</p>
                </div>
              ) : (
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#6c757d" viewBox="0 0 16 16" className="mb-2" aria-hidden>
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                    <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                  </svg>
                  <p className="mb-1 small fw-semibold text-dark">Click to upload PDF</p>
                  <p className="mb-0 small text-secondary">Text will be extracted automatically</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="d-none"
              onChange={handlePdfUpload}
            />
            {pdfError && (
              <p className="text-danger small mt-2 mb-0">{pdfError}</p>
            )}
            {pdfFileName && pasteText && (
              <div className="mt-3">
                <label className="form-label small fw-semibold text-secondary">Extracted text (you can edit)</label>
                <textarea
                  className="form-control"
                  rows={6}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  spellCheck={false}
                  autoCorrect="off"
                />
              </div>
            )}
          </div>
        )}

        {pasteText.trim() && (
          <p className="text-secondary small mt-2 mb-0">
            {pasteText.trim().split(/\s+/).length} words
          </p>
        )}
      </div>

      <div className="card border shadow-sm rounded-3 p-4 mb-4">
        <h2 className="h6 fw-semibold mb-3">Layout</h2>
        <div className="d-flex flex-column gap-2">
          {LAYOUT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="d-flex align-items-start gap-3 p-3 rounded-3 border"
              style={{
                cursor: "pointer",
                backgroundColor: layout === opt.value ? "#e8f5e9" : "#fff",
                borderColor: layout === opt.value ? "#198754" : "#dee2e6",
              }}
            >
              <input
                type="radio"
                name="layout"
                value={opt.value}
                checked={layout === opt.value}
                onChange={() => setLayout(opt.value)}
                className="form-check-input mt-1 flex-shrink-0"
              />
              <div>
                <div className="fw-semibold small">{opt.label}</div>
                <div className="text-secondary" style={{ fontSize: "0.8125rem" }}>{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="card border shadow-sm rounded-3 p-4 mb-4">
        <h2 className="h6 fw-semibold mb-3">Timer</h2>
        <div className="d-flex flex-wrap gap-2">
          {TIMER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`btn btn-sm ${timerSeconds === opt.value ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setTimerSeconds(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="d-grid">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={handleStart}
          disabled={!canStart}
        >
          Start Practice
        </button>
        {!canStart && (
          <p className="text-secondary small text-center mt-2 mb-0">
            Add some text to get started.
          </p>
        )}
      </div>
    </main>
  );
}
