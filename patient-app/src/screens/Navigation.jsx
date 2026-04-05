import { useEffect, useState, useRef } from "react"
import { updateLocation } from "../api/medirush"

export default function NavigationScreen({ go, selectedHospital, token, showToast }) {
  const h = selectedHospital || { name:"Apollo Hospitals Tirupati", eta_seconds:480, id:"h1", lat:13.6213, lng:79.4091 }
  const [eta, setEta] = useState(h.eta_seconds)
  const [doctorReady, setDoctorReady] = useState(false)
  const [showAmbulance, setShowAmbulance] = useState(false)

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`

  useEffect(() => {
    const t = setInterval(() => setEta(e => Math.max(0, e-1)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      navigator.geolocation?.getCurrentPosition(pos => {
        updateLocation(token||"A3F9-72XK", h.id, pos.coords.latitude, pos.coords.longitude)
      })
    }, 10000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_BASE||"ws://localhost:8000"}/ws/patient/${token||"A3F9-72XK"}`)
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === "DOCTOR_ACCEPTED") setDoctorReady(true)
    }
    return () => ws.close()
  }, [])

  return (
    <div className="screen" style={{ padding:0 }}>
      {/* Map Placeholder */}
      <div style={{ height:"55%", background:"#0A1628", position:"relative", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
        {/* Fake map grid */}
        <svg width="100%" height="100%" style={{ position:"absolute", inset:0, opacity:0.15 }}>
          {[...Array(10)].map((_,i) => <line key={`h${i}`} x1="0" y1={i*50} x2="100%" y2={i*50} stroke="#00C853" strokeWidth="0.5"/>)}
          {[...Array(10)].map((_,i) => <line key={`v${i}`} x1={i*50} y1="0" x2={i*50} y2="100%" stroke="#00C853" strokeWidth="0.5"/>)}
        </svg>
        {/* Route line */}
        <svg width="100%" height="100%" style={{ position:"absolute", inset:0 }}>
          <path d="M 80 300 Q 200 180 320 120" fill="none" stroke="#00C853" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 4"/>
        </svg>
        {/* Patient dot */}
        <div style={{ position:"absolute", bottom:80, left:80 }}>
          <div style={{ width:16, height:16, borderRadius:"50%", background:"#2979FF", boxShadow:"0 0 0 6px rgba(41,121,255,0.2)", animation:"heartbeat 1.2s ease infinite" }} />
        </div>
        {/* Hospital pin */}
        <div style={{ position:"absolute", top:60, right:80, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <div style={{ background:"#E53935", borderRadius:8, padding:"4px 8px", fontSize:11, color:"#fff", fontWeight:700 }}>🏥 {h.name.split(" ")[0]}</div>
          <div style={{ width:2, height:12, background:"#E53935" }} />
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#E53935" }} />
        </div>
        {/* ETA banner */}
        <div style={{ position:"absolute", top:12, left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,0.8)", borderRadius:20, padding:"6px 16px", border:"1px solid rgba(0,200,83,0.3)" }}>
          <span className="font-mono" style={{ fontSize:12, color:"#00C853" }}>Arriving in ~{Math.ceil(eta/60)} min</span>
        </div>
        <p className="font-dm" style={{ color:"rgba(255,255,255,0.3)", fontSize:11, zIndex:1 }}>Live Navigation Map</p>
      </div>

      {/* Bottom Panel */}
      <div style={{ flex:1, background:"#111", borderTop:"1px solid #2C2C2C", padding:"16px 20px 32px", display:"flex", flexDirection:"column", gap:12 }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-syne" style={{ fontSize:15, fontWeight:700 }}>{h.name}</p>
            <p className="font-dm" style={{ fontSize:11, color:"#9E9E9E" }}>Emergency Route Active</p>
          </div>
          <span className={`badge ${doctorReady?"badge-green":"badge-gold"}`}>
            {doctorReady ? "✅ Doctor Ready" : "⏳ Notifying..."}
          </span>
        </div>

        {/* ETA Countdown */}
        <div className="text-center" style={{ padding:"8px 0" }}>
          <span className="font-mono" style={{ fontSize:42, fontWeight:700, color:"#fff", letterSpacing:"-0.02em" }}>{fmt(eta)}</span>
          <p className="font-dm" style={{ fontSize:11, color:"#9E9E9E", marginTop:2 }}>estimated arrival</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => setShowAmbulance(true)} style={{ flex:1, height:48, background:"#1A1A1A", border:"1px solid #2C2C2C", borderRadius:12, color:"#fff", fontSize:12, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            🚑 Ambulance
          </button>
          <button onClick={() => { navigator.clipboard.writeText(`https://maps.google.com/?q=${h.lat},${h.lng}`); showToast("Link copied!") }} style={{ flex:1, height:48, background:"#1A1A1A", border:"1px solid #2C2C2C", borderRadius:12, color:"#fff", fontSize:12, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            📍 Share
          </button>
          <button onClick={() => go("confirmation")} style={{ flex:1, height:48, background:"#1A1A1A", border:"1px solid #2C2C2C", borderRadius:12, color:"#fff", fontSize:12, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            📋 Status
          </button>
        </div>
      </div>

      {/* Ambulance Overlay */}
      {showAmbulance && (
        <div className="drug-popup-overlay" onClick={() => setShowAmbulance(false)}>
          <div className="drug-popup" onClick={e => e.stopPropagation()}>
            <h3 className="font-syne" style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>Emergency Numbers</h3>
            {[{num:"108", label:"National Emergency Ambulance"},{num:"102", label:"Andhra Pradesh Ambulance"},{num:"1066", label:"Disaster Management"}].map(n => (
              <a key={n.num} href={`tel:${n.num}`} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:"1px solid #2C2C2C", textDecoration:"none" }}>
                <div>
                  <p className="font-mono" style={{ fontSize:22, fontWeight:700, color:"#E53935" }}>{n.num}</p>
                  <p className="font-dm" style={{ fontSize:12, color:"#9E9E9E" }}>{n.label}</p>
                </div>
                <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(229,57,53,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  📞
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}