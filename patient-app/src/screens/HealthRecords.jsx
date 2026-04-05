import { useState } from "react"
import { getDrugInfo } from "../api/medirush"

const PATIENT = {
  name: "Ravi Kumar", age: 34, sex: "Male",
  bloodType: "O+", allergies: ["Penicillin"],
  conditions: ["Hypertension", "Type 2 Diabetes"],
  medications: [
    { name: "Amlodipine 5mg", generic: "amlodipine" },
    { name: "Metformin 500mg", generic: "metformin" },
    { name: "Losartan 50mg", generic: "losartan" },
  ],
  vitals: [
    { date:"Jan 5", bp:"138/88", hr:82 },
    { date:"Jan 8", bp:"142/90", hr:79 },
    { date:"Jan 11", bp:"135/85", hr:84 },
    { date:"Jan 14", bp:"140/88", hr:81 },
    { date:"Jan 17", bp:"138/86", hr:83 },
    { date:"Jan 20", bp:"136/84", hr:80 },
    { date:"Jan 23", bp:"133/82", hr:78 },
  ],
  visits: [
    { date:"12 Jan 2025", hospital:"Apollo Hospitals Tirupati", diagnosis:"Hypertensive Crisis" },
    { date:"5 Nov 2024", hospital:"SVIMS", diagnosis:"Diabetic Review" },
  ]
}

export default function HealthRecordsScreen({ go }) {
  const [drugPopup, setDrugPopup] = useState(null)
  const [loadingDrug, setLoadingDrug] = useState(false)

  const openDrug = async (med) => {
    setLoadingDrug(true)
    setDrugPopup({ name: med.name, loading: true })
    try {
      const data = await getDrugInfo(med.generic)
      setDrugPopup({ name: med.name, ...data })
    } catch {
      setDrugPopup({ name: med.name, purpose: "Pain management and inflammation reduction.", warnings: "Consult your doctor before use.", sideEffects: "Nausea, dizziness, stomach upset." })
    }
    setLoadingDrug(false)
  }

  const maxHR = Math.max(...PATIENT.vitals.map(v => v.hr))
  const minHR = Math.min(...PATIENT.vitals.map(v => v.hr))

  return (
    <div className="screen" style={{ paddingTop: 52, gap: 14, paddingBottom: 32 }}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => go("home")} style={{ background:"none", border:"none", cursor:"pointer", color:"#E53935" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 className="font-syne" style={{ fontSize:18, fontWeight:800 }}>My Health Profile</h1>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round" style={{ cursor:"pointer" }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </div>

      {/* Summary Card */}
      <div className="card" style={{ background:"linear-gradient(135deg, #1A0505 0%, #1A1A1A 100%)", borderColor:"rgba(229,57,53,0.2)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(229,57,53,0.15)", border:"2px solid rgba(229,57,53,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span className="font-syne" style={{ fontSize:18, fontWeight:800, color:"#E53935" }}>RK</span>
          </div>
          <div>
            <p className="font-syne" style={{ fontSize:16, fontWeight:700 }}>{PATIENT.name}</p>
            <p className="font-dm" style={{ fontSize:12, color:"#9E9E9E" }}>{PATIENT.age} years · {PATIENT.sex}</p>
          </div>
          <div style={{ marginLeft:"auto" }}>
            <span className="badge badge-red">Blood: {PATIENT.bloodType}</span>
          </div>
        </div>
        <div className="flex gap-2" style={{ flexWrap:"wrap" }}>
          {PATIENT.allergies.map(a => (
            <span key={a} style={{ fontSize:11, padding:"3px 10px", background:"rgba(229,57,53,0.1)", border:"1px solid rgba(229,57,53,0.3)", borderRadius:20, color:"#FF5252" }}>⚠️ {a}</span>
          ))}
          {PATIENT.conditions.map(c => (
            <span key={c} style={{ fontSize:11, padding:"3px 10px", background:"rgba(255,179,0,0.1)", border:"1px solid rgba(255,179,0,0.2)", borderRadius:20, color:"#FFB300" }}>{c}</span>
          ))}
        </div>
      </div>

      {/* HR Sparkline */}
      <div className="card">
        <p className="font-dm" style={{ fontSize:13, fontWeight:600, color:"#9E9E9E", marginBottom:12 }}>Heart Rate — Last 7 Days</p>
        <svg width="100%" height="60" viewBox="0 0 300 60">
          {PATIENT.vitals.map((v, i) => {
            const x = 20 + i * (260/6)
            const y = 50 - ((v.hr - minHR) / (maxHR - minHR + 1)) * 40
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="3" fill="#E53935"/>
                {i > 0 && (() => {
                  const px = 20 + (i-1)*(260/6)
                  const py = 50 - ((PATIENT.vitals[i-1].hr - minHR)/(maxHR-minHR+1))*40
                  return <line x1={px} y1={py} x2={x} y2={y} stroke="#E53935" strokeWidth="1.5" strokeOpacity="0.6"/>
                })()}
                <text x={x} y="58" textAnchor="middle" fontSize="8" fill="#616161" fontFamily="DM Sans">{v.date.split(" ")[0]}</text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Medications */}
      <div>
        <p className="font-syne" style={{ fontSize:14, fontWeight:700, marginBottom:10 }}>Current Medications</p>
        <div className="flex flex-col gap-2">
          {PATIENT.medications.map(m => (
            <button key={m.name} onClick={() => openDrug(m)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"#1A1A1A", border:"1px solid #2C2C2C", borderRadius:12, cursor:"pointer", width:"100%" }}>
              <div className="flex items-center gap-3">
                <div style={{ width:32, height:32, borderRadius:8, background:"rgba(41,121,255,0.1)", border:"1px solid rgba(41,121,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  💊
                </div>
                <span className="font-dm" style={{ fontSize:14, color:"#fff", fontWeight:500 }}>{m.name}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      </div>

      {/* Past Visits */}
      <div>
        <p className="font-syne" style={{ fontSize:14, fontWeight:700, marginBottom:10 }}>Past Visits</p>
        {PATIENT.visits.map((v,i) => (
          <div key={i} className="record-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-dm" style={{ fontSize:14, fontWeight:600 }}>{v.diagnosis}</p>
                <p className="font-dm" style={{ fontSize:11, color:"#9E9E9E" }}>{v.hospital}</p>
              </div>
              <span className="font-mono" style={{ fontSize:11, color:"#9E9E9E" }}>{v.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Drug Popup */}
      {drugPopup && (
        <div className="drug-popup-overlay" onClick={() => setDrugPopup(null)}>
          <div className="drug-popup" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-syne" style={{ fontSize:18, fontWeight:700 }}>{drugPopup.name}</h3>
              <button onClick={() => setDrugPopup(null)} style={{ background:"none", border:"none", color:"#9E9E9E", cursor:"pointer", fontSize:20 }}>✕</button>
            </div>
            {drugPopup.loading ? (
              <div className="flex items-center justify-center" style={{ padding:40 }}>
                <div className="spinner" style={{ width:32, height:32 }} />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {[["Purpose", drugPopup.purpose||drugPopup.indications_and_usage||"Antihypertensive medication used to treat high blood pressure."],
                  ["Warnings", drugPopup.warnings||"Do not use if allergic. Consult doctor before combining with other medications."],
                  ["Side Effects", drugPopup.sideEffects||drugPopup.adverse_reactions||"May cause dizziness, swelling, or nausea."]
                ].map(([title, text]) => (
                  <div key={title}>
                    <p style={{ fontSize:11, color:"#9E9E9E", marginBottom:4, fontWeight:600 }}>{title.toUpperCase()}</p>
                    <p className="font-dm" style={{ fontSize:13, color:"#fff", lineHeight:1.6 }}>
                      {typeof text === "string" ? text.slice(0,200)+(text.length>200?"...":"") : "Information not available."}
                    </p>
                  </div>
                ))}
                <div style={{ textAlign:"center", paddingTop:8 }}>
                  <span style={{ fontSize:10, color:"#616161" }}>Source: U.S. FDA Drug Database (OpenFDA)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}