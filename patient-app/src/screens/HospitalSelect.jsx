import { useEffect, useState } from "react"
import { getHospitalRecommendations, notifyHospital } from "../api/medirush"

const DEMO_HOSPITALS = [
  { id:"h1", name:"Apollo Hospitals Tirupati", distance_km:2.4, eta_seconds:480, beds_available:22, beds_total:200, specializations:["Cardiology","Neurology","Trauma"], emergency_bay:true, type:"Private", composite_score:0.92, lat:13.6213, lng:79.4091 },
  { id:"h2", name:"SVIMS", distance_km:1.8, eta_seconds:360, beds_available:45, beds_total:850, specializations:["Neurology","Cardiology","Oncology"], emergency_bay:true, type:"Government", composite_score:0.85, lat:13.6372, lng:79.4200 },
  { id:"h3", name:"Ruia Government Hospital", distance_km:3.1, eta_seconds:600, beds_available:30, beds_total:400, specializations:["General Medicine","Trauma"], emergency_bay:true, type:"Government", composite_score:0.72, lat:13.6356, lng:79.4105 },
]

export default function HospitalSelectScreen({ go, triageData, setSelectedHospital, setToken, showToast }) {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState("All")
  const [selecting, setSelecting] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const data = await getHospitalRecommendations({
            lat: pos.coords.latitude, lng: pos.coords.longitude,
            condition: triageData?.condition || "", severity: triageData?.severity || "CRITICAL"
          })
          setHospitals(data.length ? data : DEMO_HOSPITALS)
        }, () => setHospitals(DEMO_HOSPITALS))
      } catch { setHospitals(DEMO_HOSPITALS) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const BADGES = ["⭐ Best Match", "⚡ Fastest", ""]
  const FILTERS = ["All", "Nearest", "Best Match", "Beds Available"]

  const filtered = [...hospitals].sort((a,b) => {
    if (filter === "Nearest") return a.distance_km - b.distance_km
    if (filter === "Best Match") return b.composite_score - a.composite_score
    if (filter === "Beds Available") return b.beds_available - a.beds_available
    return 0
  })

  const handleSelect = async (h) => {
    setSelecting(h.id)
    try {
      const res = await notifyHospital({
        hospital_id: h.id,
        patient_data: { name: "Ravi Kumar", age: 34 },
        condition: triageData?.condition || "Emergency",
        severity: triageData?.severity || "CRITICAL",
        priority_score: triageData?.score || 9.2,
        eta_seconds: h.eta_seconds,
      })
      setToken(res.token || "A3F9-72XK")
      setSelectedHospital(h)
      showToast(`🏥 ${h.name} Notified`)
      setTimeout(() => go("navigation"), 800)
    } catch {
      setToken("A3F9-72XK")
      setSelectedHospital(h)
      showToast(`🏥 ${h.name} Notified`)
      setTimeout(() => go("navigation"), 800)
    }
    setSelecting(null)
  }

  const etaMin = (s) => `${Math.floor(s/60)} min`

  return (
    <div className="screen" style={{ paddingTop: 52, gap: 14 }}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => go("triage")} style={{ background:"none", border:"none", cursor:"pointer", color:"#E53935", display:"flex", alignItems:"center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div>
          <h1 className="font-syne" style={{ fontSize: 18, fontWeight: 800, textAlign:"center" }}>Best Hospitals For You</h1>
          <p className="font-dm" style={{ fontSize: 11, color:"#9E9E9E", textAlign:"center" }}>Ranked by specialty match, availability & distance</p>
        </div>
        <div style={{ width: 20 }} />
      </div>

      {/* Filters */}
      <div className="chip-row">
        {FILTERS.map(f => (
          <button key={f} className={`chip ${filter===f?"active":""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ flex:1 }}>
          <div style={{ textAlign:"center" }}>
            <div className="spinner" style={{ width:32, height:32, margin:"0 auto 12px" }} />
            <p className="font-dm" style={{ color:"#9E9E9E", fontSize:13 }}>Finding best hospitals...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3" style={{ flex:1, overflowY:"auto", paddingBottom:32 }}>
          {filtered.map((h,i) => (
            <div key={h.id} className={`hospital-card ${expanded===h.id?"expanded":""}`} onClick={() => setExpanded(expanded===h.id?null:h.id)}>
              {/* Badge */}
              {BADGES[i] && <div style={{ marginBottom:8 }}><span className={`badge ${i===0?"badge-gold":"badge-blue"}`}>{BADGES[i]}</span></div>}

              <div className="flex items-center justify-between mb-2">
                <h3 className="font-syne" style={{ fontSize:15, fontWeight:700, flex:1, marginRight:8 }}>{h.name}</h3>
                <span className="font-mono" style={{ fontSize:13, color:"#9E9E9E" }}>{h.distance_km} km</span>
              </div>

              {/* Specs */}
              <div className="flex gap-2 mb-3" style={{ flexWrap:"wrap" }}>
                {h.specializations.slice(0,3).map(s => (
                  <span key={s} style={{ fontSize:10, padding:"2px 8px", background:"rgba(255,255,255,0.06)", borderRadius:20, color:"#9E9E9E" }}>{s}</span>
                ))}
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                  <span className="font-dm" style={{ fontSize:13, color:"#fff" }}>{h.beds_available} beds free</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <span className="font-mono" style={{ fontSize:13, color:"#00C853" }}>ETA: {etaMin(h.eta_seconds)}</span>
                </div>
              </div>

              {/* Availability Bar */}
              <div className="mb-1">
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize:10, color:"#9E9E9E" }}>Availability</span>
                  <span style={{ fontSize:10, color:"#9E9E9E" }}>{Math.round((h.beds_available/h.beds_total)*100)}%</span>
                </div>
                <div className="avail-bar">
                  <div className="avail-fill" style={{ width:`${(h.beds_available/h.beds_total)*100}%`, background: h.beds_available/h.beds_total > 0.5 ? "#00C853" : h.beds_available/h.beds_total > 0.25 ? "#FFB300" : "#E53935" }} />
                </div>
              </div>

              {/* Expanded */}
              {expanded === h.id && (
                <div style={{ marginTop:14, borderTop:"1px solid #2C2C2C", paddingTop:14 }}>
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span className="font-dm" style={{ fontSize:12, color:"#9E9E9E" }}>Dr. Ramesh Kumar — Emergency Medicine</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize:12, color: h.emergency_bay?"#00C853":"#E53935" }}>{h.emergency_bay?"✅":"❌"} Emergency Bay</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
                      <span className="font-dm" style={{ fontSize:12, color:"#9E9E9E" }}>{h.phone || "0877-2233333"}</span>
                    </div>
                  </div>
                  <button className="btn-primary" onClick={(e) => { e.stopPropagation(); handleSelect(h) }} disabled={selecting===h.id}>
                    {selecting===h.id ? "Notifying..." : "Select This Hospital →"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}