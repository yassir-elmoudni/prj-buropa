import React, { useState, useEffect } from "react";
import { getText } from "./i18n";

const languages = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
];

export default function LanguageScreen({ onSelect }) {
  const [selectedLang, setSelectedLang] = useState("en");
  const [userName, setUserName] = useState("");
  const [step, setStep] = useState("language"); // "language" or "name"

  // Load saved name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("buropa_user_name");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  const handleLanguageSelect = (langCode) => {
    setSelectedLang(langCode);
    setStep("name");
  };

  const handleContinue = () => {
    if (userName.trim()) {
      localStorage.setItem("buropa_user_name", userName.trim());
      onSelect({ lang: selectedLang, name: userName.trim() });
    }
  };

  const handleBack = () => {
    setStep("language");
  };

  if (step === "name") {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center",
        padding: "0 20px"
      }}>
        <button 
          onClick={handleBack}
          style={{ 
            position: "absolute", 
            left: 16, 
            top: 16, 
            background: "none", 
            border: "none", 
            fontSize: 24, 
            cursor: "pointer",
            color: "#666"
          }}
        >
          &larr;
        </button>
        
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 8, 
          marginBottom: 32,
          padding: "8px 16px",
          borderRadius: 20,
          background: "#f8f9fa",
          border: "1px solid #e9ecef"
        }}>
          <span style={{ fontSize: 14, color: "#666" }}>
            {languages.find(l => l.code === selectedLang)?.label}
          </span>
        </div>

        <h2 style={{ 
          fontWeight: 600, 
          marginBottom: 16,
          textAlign: "center"
        }}>
          {getText(selectedLang, "enterName")}
        </h2>
        
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder={getText(selectedLang, "namePlaceholder")}
          style={{
            width: "100%",
            maxWidth: 300,
            padding: "12px 16px",
            borderRadius: 8,
            border: "2px solid #e9ecef",
            fontSize: 16,
            marginBottom: 24,
            outline: "none",
            transition: "border-color 0.2s"
          }}
          onFocus={(e) => e.target.style.borderColor = "#e74c3c"}
          onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
          onKeyPress={(e) => e.key === "Enter" && handleContinue()}
          autoFocus
        />
        
        <button
          onClick={handleContinue}
          disabled={!userName.trim()}
          style={{
            padding: "12px 32px",
            borderRadius: 25,
            border: "none",
            background: userName.trim() ? "#e74c3c" : "#ccc",
            color: "#fff",
            fontWeight: 500,
            fontSize: 16,
            cursor: userName.trim() ? "pointer" : "not-allowed",
            transition: "background-color 0.2s"
          }}
        >
          {getText(selectedLang, "continue")}
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "center", 
      alignItems: "center" 
    }}>
      <h2 style={{ 
        fontWeight: 600, 
        marginBottom: 32,
        textAlign: "center"
      }}>
        {getText(selectedLang, "selectLanguage")}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 200 }}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            style={{
              padding: "12px 0",
              borderRadius: 20,
              border: "1px solid #e9ecef",
              background: "#fff",
              color: "#222",
              fontWeight: 500,
              fontSize: 16,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
} 