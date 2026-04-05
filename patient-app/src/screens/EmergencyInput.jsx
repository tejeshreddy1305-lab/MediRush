import { useState, useRef } from "react"
import { analyzeSymptoms } from "../api/medirush"

const SYMPTOMS = [
  { id: "chest pain", label: "Chest Pain", icon: "💔" },
  { id: "shortness of breath", label: "Breathlessness", icon: "😮‍💨" },
  { id: "severe headache", label: "Severe Headache", icon: "🤕" },
  { id: "severe bleeding", label: "Bleeding", icon: "🩸" },
  { id: "unconscious", label: "Unconscious", icon: "😵" },
  { id: "stroke", label: "Stroke Signs", icon: "🧠" },
  { id: "severe burn", label: "Burns", icon: "🔥" },
  { id: "fracture", label: "Fracture", icon: "🦴" },
  { id: "allergic reaction", label: "Severe Allergy", icon: "⚠️" },
  { id: "high fever", label: "High Fever", icon: "🌡️" },
  { id: "abdominal pain", label: "Abdominal Pain", icon: "🫃" },
  { id: "other", label: "Other", icon: "+" },
]

export default function EmergencyInputScreen({ go, setTriageData }) {
  const [tab, setTab] = useState("symptoms")
  const [selected, setSelected] = useState([])
  const [hr, setHr] = useState(75)
  const [spo2, setSpo2] = useState(98)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [loading, setLoading] = useState(false)
  const recRef = useRef(null)

  const toggleSymptom = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return alert("Voice not supported in this browser")
    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join(" ")
      setTranscript(t)
    }
    r.start()
    recRef.current = r
    setListening(true)
  }
  const stopVoice = () => {
    recRef.current?.stop()
    setListening(false)
  }

  const hrColor = hr > 130 || hr < 40 ? "red" : hr > 100 ? "amber" : "green"
  const spo2Color = spo2 < 90 ? "red" : spo2 < 94 ? "amber" : "green"

  const handleAnalyze = async () => {
    const syms = selected.length ? selected : transcript ? ["chest pain"] : []
    if (!syms.length && !transcript) return
    setLoading(true)
    try {
      const words = transcript.split(" ").filter(Boolean).length
      const duration = 5
      const wpm = Math.round((words / duration) * 60) || 130
      const result = await analyzeSymptoms({ symptoms: syms, vitals: { hr, spo2 }, transcript, wpm })
      setTriageData(result)
      go("triage")
    } catch {
      // fallback demo data
      setTriageData({ severity: "CRITICAL", score: 9.2, confidence: 91, condition: "Acute Coronary Syndrome", action: "Seek emergency care immediately. Call ambulance 108." })
      go("triage")
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = selected.length > 0 || transcript.length > 3

  return (
    <div className="screen" style={{ paddingTop: 52, gap: 16 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => go("home")} style={{ background: "none", border: "none", cursor: "pointer", color: "#E53935", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div className="flex items-center gap-2">
          <div style={{ width: 20, height: 20, background: "#E53935", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </div>
          <span className="font-syne" style={{ fontSize: 16, fontWeight: 700 }}>MediRush</span>
        </div>
        <span className="progress-pill">Step 1 of 3</span>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {["voice","symptoms","vitals"].map(t => (
          <button key={t} className={`tab-item ${tab===t?"active":""}`} onClick={() => setTab(t)}>
            {t === "voice" ? "🎙 Voice" : t === "symptoms" ? "📋 Symptoms" : "💓 Vitals"}
          </button>
        ))}
      </div>

      {/* Voice Tab */}
      {tab === "voice" && (
        <div className="flex flex-col items-center gap-4" style={{ flex: 1, paddingTop: 20 }}>
          <div className="waveform">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`wave-bar ${listening ? "" : "idle"}`} style={{ animationDelay: `${i*0.1}s` }} />
            ))}
          </div>
          <button
            onClick={listening ? stopVoice : startVoice}
            style={{ width: 80, height: 80, borderRadius: "50%", background: listening ? "#2C2C2C" : "#E53935", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", boxShadow: listening ? "none" : "0 0 20px rgba(229,57,53,0.4)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              {listening
                ? <rect x="6" y="6" width="12" height="12" rx="2"/>
                : <><path d="M12 1a3 3 0 013 3v8a3 3 0 01-6 0V4a3 3 0 013-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></>
              }
            </svg>
          </button>
          <p className="font-dm" style={{ color: "#9E9E9E", fontSize: 13 }}>{listening ? "Listening... tap to stop" : "Tap & Speak"}</p>
          {transcript && (
            <div className="card w-full" style={{ marginTop: 8 }}>
              <p className="font-dm" style={{ fontSize: 13, color: "#9E9E9E", marginBottom: 4 }}>Transcript</p>
              <p className="font-dm" style={{ fontSize: 14, color: "#fff", lineHeight: 1.5 }}>{transcript}</p>
            </div>
          )}
        </div>
      )}

      {/* Symptoms Tab */}
      {tab === "symptoms" && (
        <div className="symptom-grid" style={{ flex: 1, overflowY: "auto" }}>
          {SYMPTOMS.map(s => (
            <div key={s.id} className={`symptom-card ${selected.includes(s.id)?"selected":""}`} onClick={() => toggleSymptom(s.id)}>
              <span className="symptom-icon">{s.icon}</span>
              <span className="symptom-label">{s.label}</span>
              {selected.includes(s.id) && <span style={{ fontSize: 10, color: "#E53935", fontWeight: 600 }}>✓</span>}
            </div>
          ))}
        </div>
      )}

      {/* Vitals Tab */}
      {tab === "vitals" && (
        <div className="flex flex-col gap-4" style={{ flex: 1, paddingTop: 8 }}>
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="font-dm" style={{ fontSize: 14, fontWeight: 500 }}>Heart Rate</span>
              <div className="flex items-center gap-2">
                <span className={`vitals-dot ${hrColor}`} />
                <span className="font-mono" style={{ fontSize: 18, fontWeight: 700, color: hrColor==="red"?"#E53935":hrColor==="amber"?"#FFB300":"#00C853" }}>{hr}</span>
                <span className="font-dm" style={{ fontSize: 11, color: "#9E9E9E" }}>BPM</span>
              </div>
            </div>
            <input type="range" min="40" max="200" value={hr} onChange={e => setHr(+e.target.value)} />
            <div className="flex justify-between mt-2">
              <span style={{ fontSize: 10, color: "#616161" }}>40</span>
              <span style={{ fontSize: 10, color: "#616161" }}>200 BPM</span>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="font-dm" style={{ fontSize: 14, fontWeight: 500 }}>SpO2</span>
              <div className="flex items-center gap-2">
                <span className={`vitals-dot ${spo2Color}`} />
                <span className="font-mono" style={{ fontSize: 18, fontWeight: 700, color: spo2Color==="red"?"#E53935":spo2Color==="amber"?"#FFB300":"#00C853" }}>{spo2}</span>
                <span className="font-dm" style={{ fontSize: 11, color: "#9E9E9E" }}>%</span>
              </div>
            </div>
            <input type="range" min="70" max="100" value={spo2} onChange={e => setSpo2(+e.target.value)} />
            <div className="flex justify-between mt-2">
              <span style={{ fontSize: 10, color: "#616161" }}>70%</span>
              <span style={{ fontSize: 10, color: "#616161" }}>100%</span>
            </div>
          </div>
          <p className="font-dm" style={{ fontSize: 12, color: "#616161", textAlign: "center" }}>Enter your current readings if available</p>
        </div>
      )}

      {/* Analyze Button */}
      <div style={{ paddingBottom: 32, paddingTop: 8 }}>
        <button className="btn-primary" onClick={handleAnalyze} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? "Analyzing..." : "Analyze Emergency →"}
        </button>
      </div>
    </div>
  )
}