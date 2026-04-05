import { useEffect, useState } from "react"

const BG = { CRITICAL: "#B71C1C", MODERATE: "#E65100", NORMAL: "#1B5E20" }
const LABEL_COLOR = { CRITICAL: "#FF5252", MODERATE: "#FFAB40", NORMAL: "#69F0AE" }

export default function TriageResultScreen({ go, triageData, setHospitals }) {
  const [animated, setAnimated] = useState(false)
  const d = triageData || { severity: "CRITICAL", score: 9.2, confidence: 91, condition: "Acute Coronary Syndrome", action: "Seek emergency care immediately." }

  const R = 54, C = 2 * Math.PI * R
  const offset = C - (d.score / 10) * C

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100)
    const t = setTimeout(() => go("hospitals"), 4500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="screen" style={{ background: BG[d.severity], paddingTop: 52, alignItems: "center", justifyContent: "center", gap: 20 }}>
      {d.severity === "CRITICAL" && (
        <div className="critical-pulse" style={{ position: "absolute", inset: 0, borderRadius: 0, pointerEvents: "none", border: `3px solid #E53935` }} />
      )}

      {/* Result Card */}
      <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 24, padding: 28, width: "100%", maxWidth: 360 }}>
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

        {/* Confidence */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <span className="badge badge-red">AI Confidence: {d.confidence}%</span>
        </div>

        <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 14 }}>
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 3 }}>SUSPECTED CONDITION</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", fontFamily: "Syne" }}>{d.condition}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 3 }}>RECOMMENDED ACTION</p>
            <p style={{ fontSize: 13, color: "#333", lineHeight: 1.5 }}>{d.action}</p>
          </div>
        </div>
      </div>

      <button className="btn-primary" style={{ maxWidth: 360 }} onClick={() => go("hospitals")}>
        Find Best Hospital →
      </button>

      <p className="font-dm" style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Auto-advancing in 4 seconds...</p>
    </div>
  )
}