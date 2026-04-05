import { useState } from "react"
import "./index.css"
import HomeScreen from "./screens/Home"
import EmergencyInputScreen from "./screens/EmergencyInput"
import TriageResultScreen from "./screens/TriageResult"
import HospitalSelectScreen from "./screens/HospitalSelect"
import NavigationScreen from "./screens/Navigation"
import ConfirmationScreen from "./screens/Confirmation"
import HealthRecordsScreen from "./screens/HealthRecords"

export default function App() {
  const [screen, setScreen] = useState("home")
  const [triageData, setTriageData] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [token, setToken] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const go = (s) => setScreen(s)

  const ctx = {
    go, triageData, setTriageData,
    hospitals, setHospitals,
    selectedHospital, setSelectedHospital,
    token, setToken, showToast
  }

  const screens = {
    home: <HomeScreen {...ctx} />,
    input: <EmergencyInputScreen {...ctx} />,
    triage: <TriageResultScreen {...ctx} />,
    hospitals: <HospitalSelectScreen {...ctx} />,
    navigation: <NavigationScreen {...ctx} />,
    confirmation: <ConfirmationScreen {...ctx} />,
    records: <HealthRecordsScreen {...ctx} />,
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", maxWidth: 430, margin: "0 auto", overflow: "hidden", background: "#0D0D0D" }}>
      {screens[screen]}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}