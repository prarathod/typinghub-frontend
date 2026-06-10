import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomTypingUI } from "@/components/typing/CustomTypingUI";

type CustomTypingState = {
  text: string;
  title: string;
  timerSeconds: number;
  layout?: "show" | "hide";
};

export function CustomTypingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CustomTypingState | null;

  useEffect(() => {
    if (!state?.text?.trim()) {
      navigate("/practice/custom", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.text?.trim()) {
    return null;
  }

  return (
    <CustomTypingUI
      text={state.text}
      title={state.title || "Custom Practice"}
      autoSubmitSeconds={state.timerSeconds ?? 0}
      layout={state.layout ?? "show"}
    />
  );
}
