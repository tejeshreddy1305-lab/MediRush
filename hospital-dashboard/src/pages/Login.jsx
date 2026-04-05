import { useState } from "react"

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000"

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("doctor@apollohospitalstirupati.com")
  const [password, setPassword] = useState("doctor123")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) throw new Error("Invalid credentials")
      const data = await res.json()
      onLogin(data)
    } catch {
      // Demo fallback
      onLogin({ token: "demo", name: "Dr. Ramesh Kumar", role: "doctor", hospital_id: "h1", hospital_name: "Apollo Hospitals Tirupati" })
    }
    setLoading(false)
  }

  return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#050D1A" }}>
      <div style={{ width:380, background:"#0A1628", border:"1px solid #1A3A5C", borderRadius:20, padding:36 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <div style={{ width:36, height:36, background:"#FF3B30", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v20M2 12h20"/></svg>
          </div>
          <span style={{ fontSize:20, fontWeight:700, fontFamily:"Manrope" }}>MediRush</span>
        </div>
        <p style={{ fontSize:13, color:"#607D8B", marginBottom:28 }}>Hospital Command Center</p>

        {error && <p style={{ color:"#FF3B30", fontSize:12, marginBottom:12 }}>{error}</p>}

        <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:12, color:"#607D8B", display:"block", marginBottom:6 }}>Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)}
              style={{ width:"100%", padding:"10px 14px", background:"#0F1F3D", border:"1px solid #1A3A5C", borderRadius:10, color:"#fff", fontSize:13, fontFamily:"Manrope", outline:"none" }}/>
          </div>
          <div>
            <label style={{ fontSize:12, color:"#607D8B", display:"block", marginBottom:6 }}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              style={{ width:"100%", padding:"10px 14px", background:"#0F1F3D", border:"1px solid #1A3A5C", borderRadius:10, color:"#fff", fontSize:13, fontFamily:"Manrope", outline:"none" }}/>
          </div>
          <button type="submit" className="btn btn-accept" style={{ width:"100%", padding:12, marginTop:4, fontSize:14 }} disabled={loading}>
            {loading ? "Signing in..." : "Sign In to Dashboard"}
          </button>
        </form>

        <p style={{ fontSize:11, color:"#607D8B", marginTop:16, textAlign:"center" }}>
          Demo: doctor@apollohospitalstirupati.com / doctor123
        </p>
      </div>
    </div>
  )
}