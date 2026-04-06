import { useEffect, useRef, useState } from "react"

export default function HomeScreen({ go, language, updateLanguage }) {
  const svgRef = useRef()
  const [showLang, setShowLang] = useState(false)

  const LANGS = [
    { id: "en", name: "English", flag: "🇬🇧" },
    { id: "te", name: "తెలుగు (Telugu)", flag: "🇮🇳" },
    { id: "hi", name: "हिन्दी (Hindi)", flag: "🇮🇳" }
  ]

  const TEXT = {
    en: {
      heading: "Emergency Healthcare Assistance",
      subheading: "Get to the right hospital faster",
      btn: "EMERGENCY",
      desc: "Tap once. Help is on the way."
    },
    te: {
      heading: "అత్యవసర వైద్య సహాయం",
      subheading: "వేగంగా సరైన ఆసుపత్రికి చేరుకోండి",
      btn: "ప్రారంభించండి",
      desc: "ఒక్కసారి నొక్కండి. సహాయం అందుతుంది."
    },
    hi: {
      heading: "आपातकालीन चिकित्सा सहायता",
      subheading: "सही अस्पताल तक जल्दी पहुँचें",
      btn: "शुरू करें",
      desc: "एक बार टैप करें। मदद रास्ते में है।"
    }
  }

  const t = TEXT[language] || TEXT.en
  const currentLang = LANGS.find(l => l.id === language) || LANGS[0]

  return (
    <div className="screen" style={{ paddingTop: 0, background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ paddingTop: 52, paddingBottom: 8, paddingLeft: 20, paddingRight: 20 }}>
        <div className="flex items-center gap-2">
          <div style={{ width: 28, height: 28, background: "var(--bg)", border: "1.5px solid var(--red)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-syne" style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>MediRush</span>
        </div>
        
        {/* FEATURE 13: LANGUAGE SELECTOR */}
        <div style={{ position: "relative" }}>
          <button 
            onClick={() => setShowLang(!showLang)}
            style={{ padding: "6px 12px", borderRadius: 20, background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          >
            <span>{currentLang.flag}</span>
            <span>{currentLang.name.split(" ")[0]}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: showLang ? "rotate(180deg)" : "none", transition: "0.2s" }}><path d="M6 9l6 6 6-6"/></svg>
          </button>
          
          {showLang && (
            <>
              <div onClick={() => setShowLang(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
              <div style={{ position: "absolute", top: "110%", right: 0, width: 160, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", zIndex: 11, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
                {LANGS.map(l => (
                  <button 
                    key={l.id}
                    onClick={() => { updateLanguage(l.id); setShowLang(false); }}
                    style={{ width: "100%", padding: "12px 16px", background: language === l.id ? "var(--card)" : "transparent", border: "none", color: "var(--text)", fontSize: 13, textAlign: "left", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                  >
                    <span>{l.flag}</span>
                    <span>{l.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Translations Heading */}
      <div style={{ padding: "32px 24px 0", textAlign: "center" }}>
        <h1 className="font-syne" style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", lineHeight: 1.2, marginBottom: 8 }}>{t.heading}</h1>
        <p className="font-dm" style={{ fontSize: 16, color: "var(--text2)", lineHeight: 1.4 }}>{t.subheading}</p>
      </div>

      {/* ECG Line */}
      <div className="ecg-container" style={{ marginTop: 24 }}>
        <svg ref={svgRef} className="ecg-line" width="800" height="48" viewBox="0 0 800 48">
          <polyline
            points="0,24 40,24 50,24 60,4 70,44 80,4 90,24 100,24 140,24 150,24 160,4 170,44 180,4 190,24 200,24 240,24 250,24 260,4 270,44 280,4 290,24 300,24 340,24 350,24 360,4 370,44 380,4 390,24 400,24 440,24 450,24 460,4 470,44 480,4 490,24 500,24 540,24 550,24 560,4 570,44 580,4 590,24 600,24 640,24 650,24 660,4 670,44 680,4 690,24 700,24 740,24 750,24 760,4 770,44 780,4 790,24 800,24"
            fill="none" stroke="#E53935" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"
          />
        </svg>
      </div>

      {/* SOS Button */}
      <div className="flex flex-col items-center justify-center" style={{ marginTop: 24, gap: 0 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 220, height: 220 }}>
          <div className="sos-ring" />
          <div className="sos-ring" style={{ animationDelay: "0.7s" }} />
          <button className="sos-btn" onClick={() => go("input")} style={{ display: "flex", flexDirection: "column", gap: 8, background: "var(--red)", border: "4px solid #fff", boxShadow: "0 15px 35px var(--red-glow)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2v20M2 12h20"/>
            </svg>
            <span className="font-syne" style={{ fontSize: language === "en" ? 12 : 14, fontWeight: 800, letterSpacing: language === "en" ? "0.15em" : "0", color: "#fff", textAlign: "center" }}>{t.btn}</span>
          </button>
        </div>
        <p className="font-dm" style={{ color: "var(--text3)", fontSize: 15, marginTop: 24, textAlign: "center" }}>
          {t.desc}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3" style={{ marginTop: "auto", padding: "0 24px 32px" }}>
        <button className="btn-outline" onClick={() => go("records")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 52, background: "var(--bg)", color: "var(--text)", borderColor: "var(--border)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          My Health Records
        </button>
        <button className="btn-outline-red" onClick={() => go("hospitals")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 52, background: "var(--bg)", color: "var(--red2)", borderColor: "var(--red)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
          Find Nearest Hospital
        </button>
      </div>
    </div>
  )
}