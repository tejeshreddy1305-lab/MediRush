const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000"
const WS_BASE = import.meta.env.VITE_WS_BASE || "ws://localhost:8000"

export const analyzeSymptoms = async ({ symptoms, vitals, transcript, wpm }) => {
  const res = await fetch(`${BASE}/api/analyze_symptoms`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms, vitals, transcript, wpm }),
  })
  return res.json()
}

export const getHospitalRecommendations = async ({ lat, lng, condition, severity }) => {
  const res = await fetch(`${BASE}/api/recommend`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng, condition, severity }),
  })
  return res.json()
}

export const notifyHospital = async (body) => {
  const res = await fetch(`${BASE}/api/notify_hospital`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

export const updateLocation = async (token, hospital_id, lat, lng) => {
  await fetch(`${BASE}/api/tracking/${token}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng, hospital_id }),
  })
}

export const getDrugInfo = async (drug_name) => {
  try {
    const res = await fetch(`${BASE}/api/drug_info`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drug_name }),
    })
    return res.json()
  } catch {
    // Direct OpenFDA fallback
    const res = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${drug_name}"&limit=1`)
    const data = await res.json()
    const r = data.results?.[0] || {}
    return {
      purpose: r.purpose?.[0] || r.indications_and_usage?.[0] || "",
      warnings: r.warnings?.[0] || r.warnings_and_cautions?.[0] || "",
      sideEffects: r.adverse_reactions?.[0] || "",
    }
  }
}

export const connectPatientSocket = (token, onMessage) => {
  const ws = new WebSocket(`${WS_BASE}/ws/patient/${token}`)
  ws.onmessage = (e) => onMessage(JSON.parse(e.data))
  return ws
}