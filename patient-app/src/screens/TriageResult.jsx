import { useEffect, useState } from "react"

const BG = { CRITICAL: "#B71C1C", MODERATE: "#E65100", NORMAL: "#1B5E20" }
const LABEL_COLOR = { CRITICAL: "#FF5252", MODERATE: "#FFAB40", NORMAL: "#69F0AE" }

export default function TriageResultScreen({ go, triageData, setHospitals }) {
  const [animated, setAnimated] = useState(false)
  const [meterScale, setMeterScale] = useState(0)
  const [showComparison, setShowComparison] = useState(false)
  const d = triageData || { severity: "CRITICAL", score: 9.2, confidence: 91, condition: "Acute Coronary Syndrome", action: "Seek emergency care immediately." }

  const R = 54, C = 2 * Math.PI * R
  const offset = C - (d.score / 10) * C

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100)
    // Animate Pain Meter over 1.8s
    setTimeout(() => setMeterScale(d.score), 200)
    
    // Disable auto-advance if modal is open
    let t;
    if (!showComparison) {
      t = setTimeout(() => go("hospitals"), 8000) 
    }
    return () => clearTimeout(t)
  }, [showComparison])

  // Pain Scale Metadata
  const getPainMeta = (s) => {
    if (s <= 3) return { label: "Mild", color: "#1D9E75" }
    if (s <= 6) return { label: "Moderate", color: "#EF9F27" }
    if (s <= 8) return { label: "Severe", color: "#D85A30" }
    return { label: "Critical", color: "#E24B4A" }
  }
  const pm = getPainMeta(d.score)

  const COMPARISON = [
    { name: "Apollo Hospitals", wait: "12 min", dist: "2.4 km", trauma: "Yes ✓", icu: "22", match: "High", score: 9.2, best: true },
    { name: "SVIMS", wait: "28 min", dist: "1.8 km", trauma: "Yes ✓", icu: "45", match: "Medium", score: 8.5, best: false },
    { name: "Ruia Govt Hospital", wait: "45 min", dist: "3.1 km", trauma: "No ✗", icu: "30", match: "Low", score: 7.2, best: false },
  ]

  return (
    <div className="screen" style={{ background: BG[d.severity], paddingTop: 52, alignItems: "center", justifyContent: "center", gap: 20 }}>
      {d.severity === "CRITICAL" && (
        <div className="critical-pulse" style={{ position: "absolute", inset: 0, borderRadius: 0, pointerEvents: "none", border: `3px solid #E53935` }} />
      )}

      {/* Result Card */}
      <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 24, padding: 28, width: "100%", maxWidth: 360, shadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "#9E9E9E", textAlign: "center", marginBottom: 8 }}>EMERGENCY LEVEL</p>

        <p className="font-syne" style={{ fontSize: 40, fontWeight: 800, textAlign: "center", color: BG[d.severity], lineHeight: 1 }}>
          {d.severity}
        </p>

        {/* Gauge */}
        <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={R} fill="none" stroke="#F5F5F5" strokeWidth="10"/>
            <circle cx="70" cy="70" r={R} fill="none"
              stroke={BG[d.severity]} strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={animated ? offset : C}
              style={{ transformOrigin:"center", transform:"rotate(-90deg)", transition:"stroke-dashoffset 0.8s ease-out" }}
            />
            <text x="70" y="64" textAnchor="middle" fontSize="28" fontWeight="700" fill={BG[d.severity]} fontFamily="JetBrains Mono">{d.score}</text>
            <text x="70" y="82" textAnchor="middle" fontSize="11" fill="#9E9E9E" fontFamily="DM Sans">/ 10</text>
          </svg>
        </div>

        {/* FEATURE 1: LIVE PAIN SCALE METER */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#9E9E9E", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pain Severity Index</span>
          </div>
          <div style={{ height: 28, background: "#F0F0F0", borderRadius: 14, overflow: "hidden", position: "relative", marginBottom: 8 }}>
            <div style={{ 
              height: "100%", width: `${meterScale * 10}%`, background: pm.color, 
              transition: "width 1.8s cubic-bezier(0.34, 1.56, 0.64, 1)", 
              display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10
            }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{d.score}</span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: pm.color, textTransform: "uppercase", letterSpacing: "0.02em" }}>{pm.label}</span>
          </div>
        </div>

        {/* Confidence */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <span className="badge badge-red" style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", color: "#666" }}>
            AI Confidence: {d.confidence}%
          </span>
        </div>

        <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 14, marginBottom: 20 }}>
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 3 }}>SUSPECTED CONDITION</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", fontFamily: "Syne" }}>{d.condition}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 3 }}>RECOMMENDED ACTION</p>
            <p style={{ fontSize: 13, color: "#333", lineHeight: 1.5 }}>{d.action}</p>
          </div>
        </div>

        {/* FEATURE 2: HOSPITAL COMPARISON BUTTON */}
        <button 
          onClick={() => setShowComparison(true)}
          style={{ width: "100%", background: "none", border: "1.5px solid #E0E0E0", padding: "10px", borderRadius: 12, color: "#666", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          Compare All Hospitals
        </button>
      </div>

      <button className="btn-primary" style={{ maxWidth: 360, background: "#fff", color: BG[d.severity] }} onClick={() => go("hospitals")}>
        Find Best Hospital →
      </button>

      {!showComparison && <p className="font-dm" style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Auto-advancing in 8 seconds...</p>}

      {/* FEATURE 2: COMPARISON MODAL */}
      {showComparison && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "flex-end", animation: "fadeIn 0.3s ease" }}>
          <div onClick={() => setShowComparison(false)} style={{ position: "absolute", inset: 0 }} />
          <div className="modal-content" style={{ background: "#fff", width: "100%", height: "90%", borderRadius: "24px 24px 0 0", overflow: "hidden", display: "flex", flexDirection: "column", animation: "slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1)", position: "relative" }}>
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #F0F0F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="font-syne" style={{ fontSize: 18, fontWeight: 800 }}>Hospital Comparison</h2>
              <button onClick={() => setShowComparison(false)} style={{ background: "#F5F5F5", border: "none", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflowX: "auto", padding: "0 4px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "16px 12px", textAlign: "left", fontSize: 11, color: "var(--text2)", borderBottom: "1px solid var(--border)", background: "var(--bg)", position: "sticky", left: 0, zIndex: 2 }}>CRITERIA</th>
                    {COMPARISON.map(h => (
                      <th key={h.name} style={{ padding: "16px 12px", borderBottom: "1px solid var(--border)", background: h.best ? "rgba(46,125,50,0.05)" : "var(--bg)", borderLeft: h.best ? "2px solid var(--green)" : "none" }}>
                        {h.best && <div style={{ fontSize: 9, color: "var(--green)", fontWeight: 800, marginBottom: 4 }}>BEST MATCH</div>}
                        <div style={{ fontSize: 13, color: "var(--text)" }}>{h.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: "wait", label: "Wait Time" },
                    { key: "dist", label: "Distance" },
                    { key: "trauma", label: "Trauma Unit" },
                    { key: "icu", label: "ICU Available" },
                    { key: "match", label: "Speciality" },
                    { key: "score", label: "Overall Score" },
                  ].map(row => (
                    <tr key={row.key}>
                      <td style={{ padding: "14px 12px", fontSize: 12, fontWeight: 600, color: "var(--text2)", borderBottom: "1px solid var(--border)", background: "var(--bg)", position: "sticky", left: 0, zIndex: 1 }}>{row.label}</td>
                      {COMPARISON.map(h => (
                        <td key={h.name} style={{ padding: "14px 12px", textAlign: "center", borderBottom: "1px solid var(--border)", background: h.best ? "rgba(46,125,50,0.05)" : "transparent", borderLeft: h.best ? "2px solid var(--green)" : "none" }}>
                          {row.key === "match" ? (
                            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: h[row.key] === "High" ? "#E8F5E9" : h[row.key] === "Medium" ? "#FFF3E0" : "var(--card)", color: h[row.key] === "High" ? "var(--green)" : h[row.key] === "Medium" ? "var(--moderate)" : "var(--text3)", fontWeight: 700 }}>
                              {h[row.key]}
                            </span>
                          ) : row.key === "score" ? (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, fontWeight: 700, fontSize: 14, color: h.best ? "var(--green)" : "var(--text)" }}>
                              {h[row.key]} <span style={{ fontSize: 12 }}>⭐</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 13, color: "var(--text)", fontWeight: row.key === "wait" ? 700 : 400 }}>{h[row.key]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Verdict */}
            <div style={{ padding: "20px 24px", background: "#F9F9F9", borderTop: "1px solid #F0F0F0" }}>
              <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1.5px solid #E0E0E0", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 24 }}>💡</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 2 }}>Recommendation Verdict</p>
                  <p style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>
                    For your condition, <span style={{ fontWeight: 700, color: "#00C853" }}>Apollo Hospitals</span> is recommended because it has the shortest wait time and highest speciality match.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
