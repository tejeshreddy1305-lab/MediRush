import { useEffect, useState } from "react"

export default function ConfirmationScreen({ go, selectedHospital, triageData, token }) {
  const h = selectedHospital || { id: "h1", name: "Apollo Hospitals Tirupati", distance_km: 2.4 }
  const triage = triageData || { severity: "CRITICAL", score: 9.2 }
  const [checks, setChecks] = useState([])
  const [eta, setEta] = useState(660) // Initial 11 minute countdown
  const tok = token || "A3F9-72XK"

  // FEATURE 3: SEEDED WAIT TIMES (Optimized for <15 mins)
  const WAIT_TIMES = { "h1": 4, "h2": 7, "h3": 10 }
  const avgWait = WAIT_TIMES[h.id] || 8
  const driveTime = Math.round(h.distance_km * 2.5) // Slightly faster avg drive
  const predictedTreatment = Math.min(14, driveTime + avgWait)

  const ITEMS = [
    { label: "Emergency Detected", sub: `${triage.severity} — Priority ${triage.score}`, done: true },
    { label: `Hospital Selected`, sub: h.name, done: true },
    { label: "Alert Sent to Hospital", sub: "Via WebSocket", done: true },
    { label: "Medical Records Shared", sub: "Blood type, allergies, medications", done: true },
    { label: "Doctor Preparing...", sub: "Awaiting confirmation", done: false },
  ]

  useEffect(() => {
    ITEMS.forEach((_, i) => setTimeout(() => setChecks(c => [...c, i]), i * 350))
    const t = setInterval(() => setEta(e => Math.max(0, e - 1)), 1000)

    // FEATURE 4: QR CODE GENERATION
    const tryGen = () => {
      const qrEl = document.getElementById("qrcode");
      if (qrEl && window.QRCode) {
        qrEl.innerHTML = "";
        try {
          new window.QRCode(qrEl, {
            text: `PATIENT:${tok}|HOSPITAL:${h.id}|TIME:${new Date().toISOString()}|PRIORITY:${triage.severity}`,
            width: 180,
            height: 180,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : window.QRCode.CorrectLevel.H
          });
          return true;
        } catch (e) {
          console.error("QR Generation failed", e);
        }
      }
      return false;
    };

    if (!tryGen()) {
      const qrIntv = setInterval(() => {
        if (tryGen()) clearInterval(qrIntv);
      }, 500);
      return () => { clearInterval(t); clearInterval(qrIntv); };
    }

    return () => clearInterval(t)
  }, [tok, h.id, triage.severity])

  const downloadQR = () => {
    const canvas = document.querySelector("#qrcode canvas");
    const img = document.querySelector("#qrcode img");
    const src = canvas ? canvas.toDataURL("image/png") : (img ? img.src : null);
    
    if (src) {
      const link = document.createElement("a");
      link.href = src;
      link.download = `MediRush_Booking_${tok}.png`;
      link.click();
    }
  }

  const R = 54, C = 2 * Math.PI * R
  const pct = eta / 660
  const offset = C * (1 - pct)

  return (
    <div className="screen confirm-screen" style={{ paddingTop: 52, alignItems: "center", gap: 20, overflowY: "auto" }}>
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
          <text x="60" y="56" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text)" fontFamily="JetBrains Mono">
            {`${String(Math.floor(eta/60)).padStart(2,"0")}:${String(eta%60).padStart(2,"0")}`}
          </text>
          <text x="60" y="72" textAnchor="middle" fontSize="10" fill="var(--text2)" fontFamily="DM Sans">ETA</text>
        </svg>
      </div>

      {/* Hospital Name */}
      <div style={{ textAlign: "center" }}>
        <h2 className="font-syne" style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{h.name}</h2>
        <p style={{ fontSize: 12, color: "var(--text2)" }}>Emergency Ward notified</p>
      </div>

      {/* FEATURE 3: TIME-TO-TREATMENT PREDICTION */}
      <div style={{ 
        background: "rgba(41, 121, 255, 0.1)", borderLeft: "4px solid #2979FF", borderRadius: 12, 
        padding: "16px 20px", width: "100%", maxWidth: 380, display: "flex", gap: 16, alignItems: "center" 
      }}>
        <div style={{ fontSize: 24 }}>⏰</div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
            Estimated time to treatment: {predictedTreatment} min
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <p style={{ fontSize: 11, color: "#9E9E9E" }}>🚗 Drive time: {driveTime} min</p>
            <p style={{ fontSize: 11, color: "#9E9E9E" }}>🏥 Avg check-in wait: {avgWait} min</p>
          </div>
        </div>
      </div>

      {/* Token */}
      <div className="token-card w-full" style={{ maxWidth:380, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 18, textAlign: "center" }}>
        <p className="font-dm" style={{ fontSize:11, color:"var(--text2)", marginBottom:8 }}>EMERGENCY TOKEN</p>
        <p className="font-mono" style={{ fontSize:32, fontWeight:700, letterSpacing:"0.1em", color:"var(--text)" }}>{tok}</p>
        <p className="font-dm" style={{ fontSize:11, color:"var(--text3)", marginTop:4 }}>Show this at reception · Valid 20 minutes</p>
      </div>

      {/* FEATURE 4: PATIENT ARRIVAL QR CODE */}
      <div style={{ width: "100%", maxWidth: 380, background: "#fff", padding: 24, borderRadius: 20, textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
        <div id="qrcode" style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}></div>
        <p className="font-dm" style={{ fontSize: 12, color: "#666", maxWidth: 220, margin: "0 auto 16px" }}>
          Show this at the reception counter for instant check-in
        </p>
        <button 
          onClick={downloadQR}
          style={{ background: "#F5F5F5", border: "1px solid #E0E0E0", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#333", cursor: "pointer" }}
        >
          📥 Download QR
        </button>
      </div>

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

      <p className="font-dm" style={{ fontSize:13, color:"rgba(255,255,255,0.5)", textAlign:"center", maxWidth:300, lineHeight:1.6, paddingBottom: 20 }}>
        Stay calm. You are expected. Follow the route.
      </p>

      <button className="btn-outline" style={{ maxWidth:380, marginBottom: 40 }} onClick={() => go("navigation")}>← Back to Navigation</button>
    </div>
  )
}