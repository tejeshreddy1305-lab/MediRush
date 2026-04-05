import { useState, useEffect, useRef } from "react"

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000"
const WS_BASE = import.meta.env.VITE_WS_BASE || "ws://localhost:8000"

const DEMO_ALERTS = [
  { id:1, name:"Ravi Kumar", age:34, sex:"M", condition:"Cardiac Event", severity:"CRITICAL", score:9.2, eta_seconds:390, token:"A3F9-72XK", timestamp:"2 min ago",
    allergies:"Penicillin", bloodType:"O+", conditions:"Hypertension, Type 2 Diabetes", meds:"Amlodipine 5mg, Metformin 500mg",
    symptoms:["Chest pain","Shortness of breath","Left arm numbness"], lat:13.628, lng:79.419 },
  { id:2, name:"Priya Sharma", age:28, sex:"F", condition:"Stroke", severity:"CRITICAL", score:8.7, eta_seconds:540, token:"B7K2-91PX", timestamp:"5 min ago",
    allergies:"None", bloodType:"A+", conditions:"None", meds:"None",
    symptoms:["Face drooping","Arm weakness","Speech difficulty"], lat:13.631, lng:79.422 },
  { id:3, name:"Suresh Babu", age:55, sex:"M", condition:"Fracture", severity:"MODERATE", score:5.5, eta_seconds:720, token:"C4M8-37QZ", timestamp:"8 min ago",
    allergies:"Sulfa", bloodType:"B+", conditions:"Osteoporosis", meds:"Calcium 500mg",
    symptoms:["Leg fracture","Severe pain"], lat:13.625, lng:79.416 },
]

export default function Dashboard({ auth, onLogout }) {
  const [alerts, setAlerts] = useState(DEMO_ALERTS)
  const [active, setActive] = useState(DEMO_ALERTS[0])
  const [accepted, setAccepted] = useState({})
  const [beds, setBeds] = useState({ total:200, occupied:178, icu_total:30, icu_occ:21 })
  const [wsConnected, setWsConnected] = useState(false)
  const [patientLat, setPatientLat] = useState(13.628)
  const wsRef = useRef(null)

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(`${WS_BASE}/ws/hospital/${auth.hospital_id || "h1"}`)
      ws.onopen = () => setWsConnected(true)
      ws.onclose = () => { setWsConnected(false); setTimeout(connect, 3000) }
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data)
        if (msg.type === "EMERGENCY_ALERT") {
          const newAlert = {
            id: Date.now(), name: msg.patient?.name || "Unknown",
            age: msg.patient?.age || "—", sex: msg.patient?.sex || "—",
            condition: msg.condition, severity: msg.severity,
            score: msg.priority_score, eta_seconds: msg.eta_seconds,
            token: msg.token, timestamp: "Just now",
            symptoms: msg.patient?.symptoms || [],
            allergies: msg.patient?.allergies || "None",
            bloodType: msg.patient?.blood_type || "—",
            conditions: msg.patient?.conditions || "None",
            meds: msg.patient?.medications || "None",
            lat: msg.patient?.lat || 13.628, lng: msg.patient?.lng || 79.419
          }
          setAlerts(a => [newAlert, ...a])
          setActive(newAlert)
        }
        if (msg.type === "LOCATION_UPDATE") {
          setPatientLat(msg.lat)
        }
      }
      wsRef.current = ws
    }
    connect()
    return () => wsRef.current?.close()
  }, [auth.hospital_id])

  const handleAccept = async (alert) => {
    try {
      await fetch(`${BASE}/api/accept_case`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ token: alert.token, doctor_name: auth.name, hospital_name: auth.hospital_name || "Apollo Hospitals Tirupati" })
      })
    } catch {}
    setAccepted(a => ({...a, [alert.id]: true}))
    setBeds(b => ({...b, occupied: Math.min(b.total, b.occupied + 1)}))
  }

  const etaFmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`
  const bedPct = Math.round((beds.occupied / beds.total) * 100)
  const icuPct = Math.round((beds.icu_occ / beds.icu_total) * 100)
  const bedColor = bedPct > 80 ? "#FF3B30" : bedPct > 60 ? "#FFB300" : "#00E676"
  const icuColor = icuPct > 70 ? "#FF3B30" : icuPct > 50 ? "#FFB300" : "#00E676"

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* TOP BAR */}
      <div style={{ height:52, background:"#0A1628", borderBottom:"1px solid #1A3A5C", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, background:"#FF3B30", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v20M2 12h20"/></svg>
          </div>
          <span style={{ fontWeight:700, fontSize:15 }}>MediRush</span>
          <span style={{ fontSize:12, color:"#607D8B" }}>Hospital Dashboard</span>
          <span style={{ fontSize:12, color:"#607D8B" }}>— {auth.hospital_name || "Apollo Hospitals Tirupati"}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span className="pulse-dot" style={{ background: wsConnected ? "#00E676" : "#FF3B30" }} />
            <span style={{ fontSize:12, color: wsConnected ? "#00E676" : "#FF3B30" }}>{wsConnected ? "LIVE" : "OFFLINE"}</span>
          </div>
          <span className="badge badge-red">{alerts.filter(a=>a.severity==="CRITICAL").length} Critical</span>
          <span style={{ fontSize:12, color:"#607D8B" }}>{auth.name} · {auth.role}</span>
          <button onClick={onLogout} style={{ background:"none", border:"1px solid #1A3A5C", color:"#607D8B", padding:"4px 10px", borderRadius:6, cursor:"pointer", fontSize:12 }}>Logout</button>
        </div>
      </div>

      {/* MAIN 3-COLUMN */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"22% 1fr 28%", gap:0, overflow:"hidden" }}>

        {/* LEFT — Alert Feed */}
        <div style={{ background:"#0A1628", borderRight:"1px solid #1A3A5C", display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ padding:"12px 14px", borderBottom:"1px solid #1A3A5C", display:"flex", alignItems:"center", gap:8 }}>
            <span className="pulse-dot" />
            <span style={{ fontSize:12, fontWeight:700, letterSpacing:"0.08em" }}>INCOMING ALERTS</span>
          </div>
          <div style={{ flex:1, overflowY:"auto" }}>
            {alerts.map(a => (
              <div key={a.id}
                className={`alert-${a.severity.toLowerCase()}`}
                onClick={() => setActive(a)}
                style={{ padding:"12px 14px", cursor:"pointer", borderBottom:"1px solid #1A3A5C", background: active?.id===a.id ? "rgba(0,188,212,0.08)" : "transparent", transition:"background 0.2s", animation:"slideIn 0.3s ease" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{a.name}, {a.age}{a.sex}</span>
                  <span className={`badge badge-${a.severity==="CRITICAL"?"red":a.severity==="MODERATE"?"amber":"green"}`}>{a.severity}</span>
                </div>
                <p style={{ fontSize:12, color:"#607D8B", marginBottom:2 }}>{a.condition}</p>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span className="mono" style={{ fontSize:11, color:"#00BCD4" }}>P: {a.score}/10</span>
                  <span style={{ fontSize:10, color:"#607D8B" }}>{a.timestamp}</span>
                </div>
                {accepted[a.id] && <span className="badge badge-green" style={{ marginTop:4 }}>✓ Accepted</span>}
              </div>
            ))}
          </div>
        </div>

        {/* CENTER — Patient Card */}
        <div style={{ background:"#050D1A", overflowY:"auto", padding:20 }}>
          {active ? (
            <div style={{ animation:"slideIn 0.3s ease" }}>
              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                <div>
                  <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                    <span className={`badge badge-${active.severity==="CRITICAL"?"red":active.severity==="MODERATE"?"amber":"green"}`} style={{ fontSize:12, padding:"4px 12px" }}>
                      {active.severity}
                    </span>
                    <span className="badge badge-teal">Priority {active.score}/10</span>
                  </div>
                  <h2 style={{ fontSize:22, fontWeight:700, marginBottom:2 }}>INCOMING PATIENT</h2>
                  <p style={{ fontSize:13, color:"#607D8B" }}>Token: <span className="mono" style={{ color:"#00BCD4" }}>{active.token}</span></p>
                </div>
                <EtaCountdown seconds={active.eta_seconds} />
              </div>

              {/* Grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                {[["Name", active.name],["Age/Sex", `${active.age} / ${active.sex}`],["Condition", active.condition],["Blood Type", active.bloodType]].map(([k,v]) => (
                  <div key={k} style={{ background:"#0A1628", border:"1px solid #1A3A5C", borderRadius:10, padding:10 }}>
                    <p style={{ fontSize:10, color:"#607D8B", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.06em" }}>{k}</p>
                    <p style={{ fontSize:14, fontWeight:600 }}>{v}</p>
                  </div>
                ))}
              </div>

              {/* Symptoms */}
              <div style={{ background:"#0A1628", border:"1px solid #1A3A5C", borderRadius:12, padding:14, marginBottom:10 }}>
                <p style={{ fontSize:11, color:"#607D8B", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>Reported Symptoms</p>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {(Array.isArray(active.symptoms) ? active.symptoms : [active.symptoms]).map((s,i) => (
                    <span key={i} style={{ fontSize:12, padding:"3px 10px", background:"rgba(255,59,48,0.1)", border:"1px solid rgba(255,59,48,0.2)", borderRadius:20, color:"#FF7070" }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Medical History */}
              <div style={{ background:"#0A1628", border:"1px solid #1A3A5C", borderRadius:12, padding:14, marginBottom:14 }}>
                <p style={{ fontSize:11, color:"#607D8B", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.06em" }}>Medical History</p>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {[["Allergies", active.allergies, active.allergies!=="None"?"#FF3B30":"#00E676"],
                    ["Conditions", active.conditions, "#FFB300"],
                    ["Medications", active.meds, "#00BCD4"]].map(([k,v,c]) => (
                    <div key={k} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                      <span style={{ fontSize:11, color:"#607D8B", minWidth:80 }}>{k}:</span>
                      <span style={{ fontSize:12, color:c, fontWeight:500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:10 }}>
                <button className="btn btn-accept" style={{ flex:1 }} onClick={() => handleAccept(active)} disabled={accepted[active.id]}>
                  {accepted[active.id] ? "✓ Accepted" : "✅ Accept Case"}
                </button>
                <button className="btn btn-assign" onClick={() => alert("Assign doctor feature")}>👨‍⚕️ Assign</button>
                <button className="btn btn-escalate" onClick={() => { setBeds(b=>({...b,icu_occ:Math.min(b.icu_total,b.icu_occ+1)})); alert("Escalated to ICU") }}>🚨 ICU</button>
              </div>
            </div>
          ) : (
            <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"#607D8B" }}>
              <div style={{ textAlign:"center" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#607D8B" strokeWidth="1" style={{ marginBottom:12 }}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <p>Select an alert from the feed</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Map + Resources */}
        <div style={{ background:"#0A1628", borderLeft:"1px solid #1A3A5C", display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Mini Map */}
          <div style={{ height:"45%", background:"#030810", borderBottom:"1px solid #1A3A5C", position:"relative", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
            <svg width="100%" height="100%" style={{ position:"absolute", inset:0, opacity:0.1 }}>
              {[...Array(8)].map((_,i)=><line key={`h${i}`} x1="0" y1={i*40} x2="100%" y2={i*40} stroke="#00BCD4" strokeWidth="0.5"/>)}
              {[...Array(8)].map((_,i)=><line key={`v${i}`} x1={i*40} y1="0" x2={i*40} y2="100%" stroke="#00BCD4" strokeWidth="0.5"/>)}
            </svg>
            {/* Patient dot animated */}
            <div style={{ position:"absolute", bottom:"30%", left:"35%", width:14, height:14, borderRadius:"50%", background:"#2979FF", boxShadow:"0 0 0 6px rgba(41,121,255,0.2)", transition:"bottom 0.5s" }} />
            {/* Hospital */}
            <div style={{ position:"absolute", top:"25%", right:"20%", textAlign:"center" }}>
              <div style={{ background:"#FF3B30", borderRadius:6, padding:"2px 6px", fontSize:10, color:"#fff", fontWeight:700, marginBottom:2 }}>🏥 Apollo</div>
              <div style={{ width:2, height:10, background:"#FF3B30", margin:"0 auto" }} />
            </div>
            <div style={{ position:"absolute", top:8, left:10, background:"rgba(0,0,0,0.6)", borderRadius:6, padding:"3px 8px", border:"1px solid rgba(0,188,212,0.3)" }}>
              <span className="mono" style={{ fontSize:10, color:"#00BCD4" }}>LIVE MAP</span>
            </div>
            {/* Route */}
            <svg style={{ position:"absolute", inset:0, pointerEvents:"none" }} width="100%" height="100%">
              <path d="M 80 200 Q 150 120 230 80" fill="none" stroke="#00E676" strokeWidth="2" strokeDasharray="6 3"/>
            </svg>
            {active && <p style={{ fontSize:10, color:"#607D8B", zIndex:1 }}>{active.name} — tracking active</p>}
          </div>

          {/* Resource Status */}
          <div style={{ flex:1, overflowY:"auto", padding:14 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", color:"#607D8B", marginBottom:12 }}>RESOURCE STATUS</p>

            {[["Beds", beds.occupied, beds.total, bedColor, bedPct],
              ["ICU", beds.icu_occ, beds.icu_total, icuColor, icuPct]].map(([label, occ, total, color, pct]) => (
              <div key={label} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, color:"#607D8B" }}>{label}</span>
                  <span className="mono" style={{ fontSize:12, color }}>{total-occ} free / {total}</span>
                </div>
                <div className="bar"><div className="bar-fill" style={{ width:`${pct}%`, background:color }} /></div>
                {pct > 70 && <p style={{ fontSize:10, color:"#FF3B30", marginTop:3 }}>⚠️ Approaching capacity</p>}
              </div>
            ))}

            {[["Emergency Bay","OPEN","#00E676"],["OR","1 in use","#FFB300"],["Trauma Bay","OPEN","#00E676"]].map(([k,v,c])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #1A3A5C" }}>
                <span style={{ fontSize:12, color:"#607D8B" }}>{k}</span>
                <span style={{ fontSize:12, color:c, fontWeight:600 }}>{v}</span>
              </div>
            ))}

            <div style={{ marginTop:12 }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", color:"#607D8B", marginBottom:8 }}>STAFF ON DUTY</p>
              {[["Doctors","4"],["Nurses","12"],["Paramedics","6"]].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0" }}>
                  <span style={{ fontSize:12, color:"#607D8B" }}>{k}</span>
                  <span className="mono" style={{ fontSize:12, color:"#fff" }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[["Today's Cases","12"],["Resolved","9"],["Avg Wait","6 min"],["Critical","3"]].map(([k,v])=>(
                <div key={k} style={{ background:"#0F1F3D", borderRadius:10, padding:10, textAlign:"center" }}>
                  <p style={{ fontSize:18, fontWeight:700, fontFamily:"IBM Plex Mono", color:"#00BCD4" }}>{v}</p>
                  <p style={{ fontSize:10, color:"#607D8B", marginTop:2 }}>{k}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EtaCountdown({ seconds }) {
  const [s, setS] = useState(seconds)
  useEffect(() => { const t = setInterval(()=>setS(x=>Math.max(0,x-1)),1000); return ()=>clearInterval(t) }, [])
  const m = Math.floor(s/60), sec = s%60
  return (
    <div style={{ textAlign:"right" }}>
      <p style={{ fontSize:11, color:"#607D8B", marginBottom:2 }}>ETA</p>
      <p className="mono" style={{ fontSize:32, fontWeight:700, color: s<120?"#FF3B30":s<300?"#FFB300":"#00E676", lineHeight:1 }}>
        {String(m).padStart(2,"0")}:{String(sec).padStart(2,"0")}
      </p>
    </div>
  )
}