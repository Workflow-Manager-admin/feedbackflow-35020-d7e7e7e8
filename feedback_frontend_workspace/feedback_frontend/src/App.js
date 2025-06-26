import React, { useState, useEffect } from "react";
import "./App.css";

// Color palette from spec
const COLORS = {
  primary: "#2563eb",
  secondary: "#64748b",
  accent: "#fbbf24",
};

const BACKEND_URL = "https://vscode-internal-74-qa.qa01.cloud.kavia.ai:3001";

// PUBLIC_INTERFACE
function App() {
  // Theme for light (fixed, as per requirements)
  const [feedback, setFeedback] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch list of submitted feedbacks from backend
  useEffect(() => {
    fetchFeedback();
  }, []);

  // PUBLIC_INTERFACE
  async function fetchFeedback() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/feedback`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Could not fetch feedback entries.");
      const data = await res.json();
      setFeedbackList(Array.isArray(data) ? data : data.feedback || []);
    } catch (err) {
      setError("Failed to fetch feedback entries.");
    } finally {
      setLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (feedback.trim().length < 3) {
      setError("Feedback must be at least 3 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedback.trim() }),
      });
      if (!res.ok) throw new Error("Submission failed.");
      setFeedback("");
      setSuccess("Feedback submitted!");
      // Refresh feedback list
      fetchFeedback();
    } catch (err) {
      setError("Error submitting feedback.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 1500);
    }
  }

  // PUBLIC_INTERFACE
  function handleChange(e) {
    setFeedback(e.target.value);
    setError("");
  }

  return (
    <div
      className="App"
      style={{
        background: "var(--bg-primary)",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          background: "#fff",
          boxShadow: "0 2px 8px rgba(36,47,66,.04)",
          borderBottom: `2px solid ${COLORS.accent}`,
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1,
          padding: "1.3rem 0",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: "1.2rem",
            color: COLORS.primary,
            letterSpacing: "0.03em",
            marginLeft: "2rem",
          }}
        >
          Feedback
        </span>
      </header>
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "6.5rem",
          width: "100%",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: 420,
            padding: "2.2rem 2.2rem 1.5rem 2.2rem",
            borderRadius: 16,
            boxShadow: "0 6px 24px 0 rgba(36,47,66,.06)",
            background: "#fff",
            marginBottom: "2.2rem",
            border: `1px solid ${COLORS.secondary}22`,
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <label
              htmlFor="feedback-input"
              style={{
                fontWeight: 600,
                color: COLORS.primary,
                marginBottom: 6,
                fontSize: "1.1rem",
                letterSpacing: "0.01em",
              }}
            >
              Leave your feedback
            </label>
            <textarea
              id="feedback-input"
              rows={3}
              maxLength={300}
              required
              placeholder="Share your thoughts..."
              value={feedback}
              onChange={handleChange}
              style={{
                borderRadius: 10,
                resize: "vertical",
                border: `1.5px solid ${COLORS.secondary}77`,
                padding: "0.9rem",
                fontSize: "1rem",
                outline: "none",
                minHeight: 48,
                color: COLORS.primary,
                background: "#f8fafc",
                transition: "border 0.2s",
              }}
            />
            <button
              type="submit"
              disabled={loading || feedback.trim().length < 3}
              style={{
                background: COLORS.primary,
                color: "#fff",
                border: "none",
                borderRadius: 9,
                fontWeight: 500,
                fontSize: "1.02rem",
                padding: "0.7rem 0",
                marginTop: 8,
                cursor: loading || feedback.trim().length < 3 ? "not-allowed" : "pointer",
                boxShadow: "0 2px 10px 0 rgba(36,66,66,.06)",
                transition: "background 0.18s",
                opacity: loading || feedback.trim().length < 3 ? 0.75 : 1,
                width: "100%",
                letterSpacing: "0.01em",
              }}
              aria-disabled={loading || feedback.trim().length < 3}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            {error && (
              <span style={{ color: "#e11d48", marginTop: 4, fontSize: "0.96rem" }}>{error}</span>
            )}
            {success && (
              <span style={{ color: COLORS.accent, marginTop: 4, fontWeight: 500, fontSize: "1.01rem" }}>
                {success}
              </span>
            )}
          </form>
        </section>
        <section
          style={{
            width: "100%",
            maxWidth: 630,
            background: "#fff",
            borderRadius: 14,
            border: `1px solid ${COLORS.secondary}22`,
            boxShadow: "0 6px 20px 0 rgba(36,47,66,.03)",
            padding: "1.5rem 1.9rem 2rem 1.9rem",
            minHeight: 120,
          }}
        >
          <div
            style={{
              color: COLORS.primary,
              fontSize: "1.11rem",
              fontWeight: 600,
              marginBottom: 14,
              letterSpacing: 0,
            }}
          >
            Submitted Feedback
          </div>
          {loading && feedbackList.length === 0 ? (
            <div style={{ color: COLORS.secondary, fontSize: "1rem" }}>Loading feedback...</div>
          ) : feedbackList.length === 0 ? (
            <div style={{ color: COLORS.secondary, fontSize: "1rem" }}>No feedback yet.</div>
          ) : (
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {feedbackList.slice(0).reverse().map((item, i) => (
                <li
                  key={item.id || i}
                  style={{
                    borderLeft: `4px solid ${COLORS.accent}`,
                    background: "#f8f9fa",
                    padding: "1rem 1.2rem",
                    borderRadius: 7,
                    boxShadow: "0 2px 6px rgba(36,47,66,.04)",
                    fontSize: "1rem",
                    color: COLORS.primary,
                    wordBreak: "break-word"
                  }}
                >
                  <span>{item.feedback || item.text || item.content || "No content"}</span>
                  <br />
                  <span style={{ color: COLORS.secondary, fontSize: "0.93rem", fontWeight: 400 }}>
                    {item.timestamp
                      ? new Date(item.timestamp).toLocaleString()
                      : item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
