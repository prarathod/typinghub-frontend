import { Link } from "react-router-dom";

const features = [
  {
    category: "Typing Practice",
    items: [
      {
        icon: "⌨️",
        title: "English Typing Practice",
        description: "Practice English typing with paragraphs designed for government exams. Improve your speed and accuracy with real exam-style content."
      },
      {
        icon: "🔤",
        title: "Marathi Typing Practice",
        description: "Master Marathi typing with authentic passages. Perfect for regional language typing exams and government positions."
      },
      {
        icon: "📚",
        title: "Multiple Exam Categories",
        description: "Practice for different exam types: Lessons, Court Exam Typing Practice, and MPSC Exam Typing. More categories coming soon!"
      },
      {
        icon: "📊",
        title: "Real-time Performance Metrics",
        description: "Track your typing speed (WPM), keystrokes per minute (KPM), accuracy percentage, and detailed error analysis in real-time."
      }
    ]
  },
  {
    category: "Advanced Typing Features",
    items: [
      {
        icon: "🎨",
        title: "Text Highlighting",
        description: "Character-level visual feedback with color-coded highlights: Green for correct, Red for incorrect, and Gray for not yet typed."
      },
      {
        icon: "⏱️",
        title: "Smart Timer",
        description: "Automatic timer that starts on your first keystroke and stops on submission. Track your typing speed accurately."
      },
      {
        icon: "🔍",
        title: "Font Size Controls",
        description: "Adjustable font size for both reference paragraph and typing area. Customize your practice environment for optimal comfort."
      },
      {
        icon: "🖥️",
        title: "Fullscreen Mode",
        description: "Focus mode with fullscreen support. Eliminate distractions and practice in an immersive typing environment."
      },
      {
        icon: "⌫",
        title: "Backspace Control",
        description: "Toggle backspace functionality on/off. Practice typing without corrections to improve accuracy and speed."
      },
      {
        icon: "🔄",
        title: "Restart & Retry",
        description: "Easily restart your practice session or retry the same paragraph to improve your performance."
      }
    ]
  },
  {
    category: "Court Exam Features",
    items: [
      {
        icon: "📄",
        title: "PDF Download",
        description: "Download paragraph as PDF with title, description, and instructions. Perfect for offline practice and exam preparation."
      },
      {
        icon: "⏰",
        title: "Auto-Submit Timer",
        description: "Set automatic submission at 5, 10, or 15 minutes. Simulate real exam conditions with time-bound practice."
      },
      {
        icon: "👁️",
        title: "Hide Reference Paragraph",
        description: "Start typing mode hides the reference paragraph, just like in real exams. Test your memory and typing skills."
      },
      {
        icon: "⏱️",
        title: "Show/Hide Timer",
        description: "Toggle timer visibility during practice. Control your exam environment exactly as you prefer."
      }
    ]
  },
  {
    category: "Performance Analytics",
    items: [
      {
        icon: "🏆",
        title: "Leaderboard",
        description: "See top 10 performers for each paragraph. Know where you stand and compete with other typists."
      },
      {
        icon: "📈",
        title: "Progress History",
        description: "Track your improvement over time with detailed history graphs. View all your past submissions with comprehensive statistics."
      },
      {
        icon: "📊",
        title: "Detailed Results",
        description: "Get comprehensive test results including time taken, accuracy, WPM, KPM, total keystrokes, backspace count, and error breakdown."
      },
      {
        icon: "✅",
        title: "Error Analysis",
        description: "Detailed error counting: omitted words, substitutions, extra words, spelling errors, and capitalization mistakes (for English)."
      },
      {
        icon: "📉",
        title: "Performance Stats",
        description: "View your best time, best WPM, average accuracy, and total attempts. Track your progress with meaningful statistics."
      }
    ]
  },
  {
    category: "Content & Organization",
    items: [
      {
        icon: "🆓",
        title: "Free & Paid Content",
        description: "Access free practice paragraphs to get started. Unlock premium content for advanced practice and exam preparation."
      },
      {
        icon: "📊",
        title: "Difficulty Levels",
        description: "Practice paragraphs categorized by difficulty: Easy, Intermediate, and Hard. Progress at your own pace."
      },
      {
        icon: "🔍",
        title: "Smart Filtering",
        description: "Filter paragraphs by price (Free/Paid/All) and difficulty level. Find the perfect practice content for your needs."
      },
      {
        icon: "✅",
        title: "Progress Tracking",
        description: "See which paragraphs you've solved and which ones are pending. Track your completion status at a glance."
      }
    ]
  },
  {
    category: "User Experience",
    items: [
      {
        icon: "👤",
        title: "User Profiles",
        description: "Create your account, track your progress, and access personalized features. Sign in with Google for quick access."
      },
      {
        icon: "💾",
        title: "Submission Storage",
        description: "All your typing submissions are automatically saved. Review your history and track improvement over time."
      },
      {
        icon: "🎯",
        title: "Personalized Dashboard",
        description: "View your standing, best performances, and detailed statistics. Get insights into your typing journey."
      },
      {
        icon: "📱",
        title: "Responsive Design",
        description: "Practice typing on any device. Fully responsive design works seamlessly on desktop, tablet, and mobile devices."
      }
    ]
  }
];

export function FeaturesPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto text-center">
              <h1 className="display-4 fw-bold mb-4">Complete Typing Solution</h1>
              <p className="lead mb-4">
                Everything you need to master typing for government exams. Practice, improve, and excel with our comprehensive features.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/practice" className="btn btn-light btn-lg">
                  Start Practicing
                </Link>
                <Link to="/" className="btn btn-outline-light btn-lg">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-5">
        <div className="container py-5">
          {features.map((category) => (
            <div key={category.category} className="mb-5">
              <h2 className="h3 fw-bold text-center mb-4 text-primary">
                {category.category}
              </h2>
              <div className="row g-4">
                {category.items.map((feature, index) => (
                  <div key={index} className="col-md-6 col-lg-4">
                    <div
                      className="card border-0 shadow-sm h-100 p-4"
                      style={{
                        transition: "transform 0.2s, box-shadow 0.2s",
                        height: "100%"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "";
                      }}
                    >
                      <div className="d-flex align-items-start gap-3">
                        <div
                          className="fs-1 flex-shrink-0"
                          style={{ lineHeight: 1 }}
                        >
                          {feature.icon}
                        </div>
                        <div className="flex-grow-1">
                          <h3 className="h5 fw-bold mb-2">{feature.title}</h3>
                          <p className="text-muted small mb-0">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-light py-5">
        <div className="container py-5">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h2 className="h3 fw-bold mb-3">Ready to Improve Your Typing?</h2>
              <p className="text-muted mb-4">
                Join thousands of students preparing for government typing exams. Start practicing today!
              </p>
              <Link to="/practice" className="btn btn-primary btn-lg px-5">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
