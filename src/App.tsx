import { Routes, Route, useLocation } from "react-router-dom";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminParagraphsPage } from "@/pages/admin/AdminParagraphsPage";
import { AdminSubmissionsPage } from "@/pages/admin/AdminSubmissionsPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AboutPage } from "@/pages/AboutPage";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { ContactPage } from "@/pages/ContactPage";
import { DisclaimerPage } from "@/pages/DisclaimerPage";
import { EnglishPracticePage } from "@/pages/EnglishPracticePage";
import { FeaturesPage } from "@/pages/FeaturesPage";
import { LandingPage } from "@/pages/LandingPage";
import { MarathiPracticePage } from "@/pages/MarathiPracticePage";
import { PracticePage } from "@/pages/PracticePage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RefundPolicyPage } from "@/pages/RefundPolicyPage";
import { TermsPage } from "@/pages/TermsPage";
import { TypingPageErrorBoundary } from "@/components/TypingPageErrorBoundary";
import { TypingPage } from "@/pages/TypingPage";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isTypingPage = /^\/practice\/english\/[^/]+$/.test(location.pathname);

  return (
    <div
      className="d-flex flex-column"
      style={{ minHeight: "100vh" }}
    >
      {!isAdminRoute && !isTypingPage && <Navbar />}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={isTypingPage ? { backgroundColor: "#f6f9fb", minHeight: "100vh", width: "100%" } : undefined}
      >
        <Routes>
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <AdminLayout>
                  <AdminUsersPage />
                </AdminLayout>
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/paragraphs"
            element={
              <AdminProtectedRoute>
                <AdminLayout>
                  <AdminParagraphsPage />
                </AdminLayout>
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/submissions"
            element={
              <AdminProtectedRoute>
                <AdminLayout>
                  <AdminSubmissionsPage />
                </AdminLayout>
              </AdminProtectedRoute>
            }
          />
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/practice/lessons" element={<EnglishPracticePage />} />
          <Route path="/practice/court-exam" element={<EnglishPracticePage />} />
          <Route path="/practice/mpsc" element={<EnglishPracticePage />} />
          <Route path="/practice/english/:id" element={<TypingPageErrorBoundary><TypingPage /></TypingPageErrorBoundary>} />
          <Route path="/practice/marathi" element={<MarathiPracticePage />} />
        </Routes>
      </div>
      {!isAdminRoute && !isTypingPage && <Footer />}
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
