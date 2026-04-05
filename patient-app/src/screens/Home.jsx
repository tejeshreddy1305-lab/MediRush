import { useEffect, useRef } from "react"

export default function HomeScreen({ go }) {
  const svgRef = useRef()

  return (
    <div className="screen" style={{ paddingTop: 0, background: "#0D0D0D" }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ paddingTop: 52, paddingBottom: 8 }}>
        <div className="flex items-center gap-2">
          <div style={{ width: 28, height: 28, background: "#E53935", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-syne" style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>MediRush</span>
        </div>
        <button onClick={() => go("records")} style={{ width: 36, height: 36, borderRadius: "50%", background: "#1A1A1A", border: "1px solid #2C2C2C", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </button>
      </div>

      {/* ECG Line */}
      <div className="ecg-container" style={{ marginTop: 16 }}>
        <svg ref={svgRef} className="ecg-line" width="800" height="48" viewBox="0 0 800 48">
          <polyline
            points="0,24 40,24 50,24 60,4 70,44 80,4 90,24 100,24 140,24 150,24 160,4 170,44 180,4 190,24 200,24 240,24 250,24 260,4 270,44 280,4 290,24 300,24 340,24 350,24 360,4 370,44 380,4 390,24 400,24 440,24 450,24 460,4 470,44 480,4 490,24 500,24 540,24 550,24 560,4 570,44 580,4 590,24 600,24 640,24 650,24 660,4 670,44 680,4 690,24 700,24 740,24 750,24 760,4 770,44 780,4 790,24 800,24"
            fill="none" stroke="#E53935" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"
          />
        </svg>
      </div>

      {/* SOS Button */}
      <div className="flex flex-col items-center justify-center" style={{ marginTop: 32, gap: 0 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 200, height: 200 }}>
          <div className="sos-ring" />
          <div className="sos-ring" style={{ animationDelay: "0.7s" }} />
          <button className="sos-btn" onClick={() => go("input")}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2v20M2 12h20"/>
            </svg>
            <span className="font-syne" style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", color: "#fff" }}>EMERGENCY</span>
          </button>
        </div>
        <p className="font-dm" style={{ color: "#9E9E9E", fontSize: 14, marginTop: 20, textAlign: "center" }}>
          Tap once. Help is on the way.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3" style={{ marginTop: 32 }}>
        <button className="btn-outline" onClick={() => go("records")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          My Health Records
        </button>
        <button className="btn-outline-red" onClick={() => go("hospitals")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
          Find Nearest Hospital
        </button>
      </div>

      {/* Location Strip */}
      <div className="flex items-center gap-2" style={{ marginTop: "auto", paddingBottom: 32, paddingTop: 24, justifyContent: "center" }}>
        <span className="vitals-dot green" />
        <span className="font-dm" style={{ fontSize: 12, color: "#9E9E9E" }}>Location: Tirupati, Andhra Pradesh</span>
      </div>
    </div>
  )
}