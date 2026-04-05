import { useEffect, useState } from "react"

export default function ConfirmationScreen({ go, selectedHospital, token }) {
  const h = selectedHospital || { name: "Apollo Hospitals Tirupati" }
  const [checks, setChecks] = useState([])
  const [eta, setEta] = useState(390)
  const tok = token || "A3F9-72XK"

  const ITEMS = [
    { label: "Emergency Detected", sub: "CRITICAL — Priority 9.2", done: true },
    { label: `Hospital Selected`, sub: h.name, done: true },
    { label: "Alert Sent to Hospital", sub: "Via WebSocket", done: true },
    { label: "Medical Records Shared", sub: "Blood type, allergies, medications", done: true },
    { label: "Doctor Preparing...", sub: "Awaiting confirmation", done: false },
  ]

  useEffect(() => {
    ITEMS.forEach((_, i) => setTimeout(() => setChecks(c => [...c, i]), i * 350))
    const t = setInterval(() => setEta(e => Math.max(0, e - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  const R = 54, C = 2 * Math.PI * R
  const pct = eta / 390
  const offset = C * (1 - pct)

  return (
    <div className="screen confirm-screen" style={{ paddingTop: 52, alignItems: "center", gap: 20 }}>
      {/* Checkmark */}
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(0,200,83,0.2)" strokeWidth="3"/>
        <circle cx="40" cy="40" r="36" fill="none" stroke="#00C853" strokeWidth="3"
          strokeDasharray="226" strokeDashoffset="0"
          style={{ transformOrigin:"center", transform:"rotate(-90deg)", transition:"stroke-dashoffset 1s ease" }}
        />
        <path d="M26 40l10 10 18-18" fill="none" stroke="#00C853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray:50, strokeDashoffset:0, transition:"stroke-dashoffset 0.6s 0.4s ease" }}
        />
      </svg>

      {/* ETA Ring */}
      <div style={{ position:"relative", width:120, height:120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8"/>
          <circle cx="60" cy="60" r={R} fill="none" stroke="#2979FF" strokeWidth="8"
            strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
            style={{ transformOrigin:"center", transform:"rotate(-90deg)", transition:"stroke-dashoffset 1s linear" }}
          />
          <text x="60" y="56" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff" fontFamily="JetBrains Mono">
            {`${String(Math.floor(eta/60)).padStart(2,"0")}:${String(eta%60).padStart(2,"0")}`}
          </text>
          <text x="60" y="72" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)" fontFamily="DM Sans">ETA</text>
        </svg>
      </div>

      {/* Checklist */}
      <div className="card w-full" style={{ maxWidth:380 }}>
        {ITEMS.map((item, i) => (
          <div key={i} className="checklist-item" style={{ animationDelay:`${i*350}ms`, opacity: checks.includes(i) ? 1 : 0.3 }}>
            <div className={`check-icon ${checks.includes(i) ? (item.done ? "done" : "spin") : "wait"}`}>
              {checks.includes(i) ? (item.done ? "✓" : <span className="spinner" />) : "○"}
            </div>
            <div>
              <p className="font-dm" style={{ fontSize:14, fontWeight:500 }}>{item.label}</p>
              <p className="font-dm" style={{ fontSize:11, color:"#9E9E9E" }}>{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Token */}
      <div className="token-card w-full" style={{ maxWidth:380 }}>
        <p className="font-dm" style={{ fontSize:11, color:"#9E9E9E", marginBottom:8 }}>EMERGENCY TOKEN</p>
        <p className="font-mono" style={{ fontSize:28, fontWeight:700, letterSpacing:"0.1em", color:"#fff" }}>{tok}</p>
        <p className="font-dm" style={{ fontSize:11, color:"#9E9E9E", marginTop:4 }}>Show this at reception · Valid 18 minutes</p>
      </div>

      <p className="font-dm" style={{ fontSize:13, color:"rgba(255,255,255,0.5)", textAlign:"center", maxWidth:300, lineHeight:1.6 }}>
        Stay calm. You are expected. Follow the route.
      </p>

      <button className="btn-outline" style={{ maxWidth:380 }} onClick={() => go("navigation")}>← Back to Navigation</button>
    </div>
  )
}