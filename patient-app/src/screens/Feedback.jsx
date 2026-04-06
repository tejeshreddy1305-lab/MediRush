import { useState } from "react"

export default function FeedbackScreen({ go, showToast }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const LABELS = {
    1: "Very Poor",
    2: "Poor",
    3: "Okay",
    4: "Good",
    5: "Excellent"
  }

  const handleSubmit = () => {
    const data = { rating, comment, timestamp: new Date().toISOString() }
    localStorage.setItem("emergency_feedback", JSON.stringify(data))
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="screen" style={{ background: "var(--bg)", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 24 }}>
        <div style={{ width: 80, height: 80, background: "#00C853", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <h2 className="font-syne" style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>Thank you!</h2>
          <p className="font-dm" style={{ fontSize: 16, color: "var(--text2)", maxWidth: 280 }}>Your feedback has been recorded. It helps us improve care for everyone.</p>
        </div>
        <button className="btn-primary" onClick={() => go("home")} style={{ maxWidth: 240, marginTop: 12 }}>
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="screen" style={{ background: "var(--bg)", paddingTop: 60, paddingLeft: 24, paddingRight: 24 }}>
      <h1 className="font-syne" style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", marginBottom: 8, textAlign: "center" }}>
        How was your emergency response?
      </h1>
      <p className="font-dm" style={{ fontSize: 16, color: "var(--text2)", textAlign: "center", marginBottom: 40 }}>
        Your feedback helps improve care for everyone
      </p>

      {/* Star Rating */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 40 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", transition: "transform 0.1s" }}
            >
              <svg 
                width="48" height="48" viewBox="0 0 24 24" 
                fill={(hoverRating || rating) >= star ? "#F9A825" : "none"} 
                stroke={(hoverRating || rating) >= star ? "#F9A825" : "var(--border)"} 
                strokeWidth="1.5"
                style={{ transform: (hoverRating === star) ? "scale(1.2)" : "scale(1)" }}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          ))}
        </div>
        <p className="font-syne" style={{ fontSize: 18, fontWeight: 700, color: (hoverRating || rating) ? "#F9A825" : "var(--text3)", height: 24 }}>
          {LABELS[hoverRating || rating] || ""}
        </p>
      </div>

      {/* Comment Input */}
      <textarea
        placeholder="Tell us more (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{ 
          width: "100%", height: 120, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, 
          padding: 16, color: "var(--text)", fontSize: 15, fontFamily: "inherit", marginBottom: 24, resize: "none", outline: "none" 
        }}
      />

      <button 
        className="btn-primary" 
        onClick={handleSubmit}
        disabled={rating === 0}
        style={{ opacity: rating === 0 ? 0.5 : 1 }}
      >
        Submit Feedback
      </button>

      <button 
        onClick={() => go("home")}
        style={{ display: "block", margin: "24px auto", background: "none", border: "none", color: "#666", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
      >
        Skip
      </button>
    </div>
  )
}
