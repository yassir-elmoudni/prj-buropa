import React, { useEffect, useRef, useState } from "react";
import { getText } from "./i18n";

const greetings = {
  fr: (name) => `Bonjour ${name}, je suis là pour vous aider. Comment puis-je vous aider aujourd'hui ?`,
  en: (name) => `Hello ${name}, I'm here to help you. How can I assist you today?`,
  ar: (name) => `مرحباً ${name}، أنا هنا لمساعدتك. كيف يمكنني مساعدتك اليوم؟`,
};

export default function VoiceScreen({ lang, user, onBack }) {
  const [listening, setListening] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [error, setError] = useState(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!listening) return;
    let mounted = true;
    async function start() {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        sourceRef.current.connect(analyserRef.current);
        dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
        setError(null);
        
        function tick() {
          if (!mounted) return;
          analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
          // Calculate volume as normalized RMS
          let sum = 0;
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            let v = (dataArrayRef.current[i] - 128) / 128;
            sum += v * v;
          }
          const newVolume = Math.min(1, Math.sqrt(sum / dataArrayRef.current.length) * 3);
          setVolume(newVolume);
          rafRef.current = requestAnimationFrame(tick);
        }
        tick();
      } catch (err) {
        console.error("Microphone error:", err);
        setError(err.name === "NotAllowedError" ? "micPermissionError" : "micNotSupported");
        setListening(false);
      }
    }
    start();
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [listening]);

  const greeting = greetings[lang] ? greetings[lang](user.name) : greetings.en(user.name);
  const circleSize = 260 + volume * 80;
  const pulseSize = listening ? circleSize + 20 : circleSize;

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "#fff",
      position: "relative"
    }}>
      <button 
        onClick={onBack} 
        style={{ 
          position: "absolute", 
          left: 16, 
          top: 16, 
          background: "none", 
          border: "none", 
          fontSize: 24, 
          cursor: "pointer",
          color: "#666",
          transition: "color 0.2s"
        }}
        onMouseEnter={(e) => e.target.style.color = "#e74c3c"}
        onMouseLeave={(e) => e.target.style.color = "#666"}
      >
        &larr;
      </button>

      <div style={{ 
        flex: 1, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        width: "100%",
        position: "relative"
      }}>
        {/* Pulse effect when listening */}
        {listening && (
          <div
            style={{
              position: "absolute",
              width: pulseSize,
              height: pulseSize,
              borderRadius: "50%",
              background: "rgba(231, 76, 60, 0.1)",
              animation: "pulse 1.5s ease-in-out infinite alternate",
            }}
          />
        )}
        
        {/* Main circle */}
        <div
          style={{
            width: circleSize,
            height: circleSize,
            borderRadius: "50%",
            background: listening 
              ? `radial-gradient(circle at 30% 30%, #fff 0%, #e74c3c ${50 + volume * 30}%, #c0392b 100%)`
              : "radial-gradient(circle at 30% 30%, #fff 0%, #e74c3c 100%)",
            boxShadow: listening 
              ? `0 8px 32px rgba(231, 76, 60, ${0.3 + volume * 0.4})`
              : "0 4px 32px #e74c3c33",
            transition: "width 0.1s, height 0.1s, box-shadow 0.1s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1
          }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#fff",
          padding: "16px 24px",
          borderRadius: 8,
          border: "1px solid #e74c3c",
          color: "#e74c3c",
          fontSize: 14,
          textAlign: "center",
          zIndex: 10
        }}>
          {getText(lang, error)}
        </div>
      )}

      {/* Greeting message */}
      <div style={{ 
        width: "100%", 
        textAlign: lang === "ar" ? "right" : "center", 
        direction: lang === "ar" ? "rtl" : "ltr", 
        padding: "24px", 
        fontSize: 18, 
        fontWeight: 400,
        maxWidth: "600px"
      }}>
        {greeting}
      </div>

      {/* Microphone button */}
      <button
        onClick={() => setListening((v) => !v)}
        style={{
          background: listening ? "#e74c3c" : "#fff",
          border: "4px solid #e74c3c",
          color: listening ? "#fff" : "#e74c3c",
          borderRadius: "50%",
          width: 64,
          height: 64,
          fontSize: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 32px auto",
          boxShadow: listening 
            ? "0 4px 16px rgba(231, 76, 60, 0.4)"
            : "0 2px 8px rgba(231, 76, 60, 0.2)",
          cursor: "pointer",
          transition: "all 0.2s",
          position: "relative"
        }}
        onMouseEnter={(e) => {
          if (!listening) {
            e.target.style.transform = "scale(1.1)";
            e.target.style.boxShadow = "0 4px 16px rgba(231, 76, 60, 0.3)";
          }
        }}
        onMouseLeave={(e) => {
          if (!listening) {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 2px 8px rgba(231, 76, 60, 0.2)";
          }
        }}
        aria-label={getText(lang, "microphone")}
      >
        <span role="img" aria-label="microphone">🎤</span>
      </button>

      {/* Status text */}
      <div style={{
        textAlign: "center",
        fontSize: 14,
        color: "#666",
        marginBottom: "16px"
      }}>
        {listening ? getText(lang, "listening") : getText(lang, "notListening")}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.1);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
} 