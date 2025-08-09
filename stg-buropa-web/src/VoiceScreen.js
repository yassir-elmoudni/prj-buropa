import React, { useEffect, useRef, useState } from "react";
import { getText } from "./i18n";
import { fetchProductsFromAudio, saveAudioFile } from "../services/service.js";

const greetings = {
  fr: (name) => `Bonjour ${name}, je suis là pour vous aider. Comment puis-je vous aider aujourd'hui ?`,
  en: (name) => `Hello ${name}, I'm here to help you. How can I assist you today?`,
  ar: (name) => `مرحباً ${name}، أنا هنا لمساعدتك. كيف يمكنني مساعدتك اليوم؟`,
};

const langCodes = {
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-SA'
};

export default function VoiceScreen({ lang, user, onBack }) {
  const [listening, setListening] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [products, setProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const rafRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = langCodes[lang] || 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError('speechRecognitionError');
      };
    }
  }, [lang]);

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
        
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `recording-${timestamp}.wav`;
          
          const saveResult = await saveAudioFile(audioBlob, filename);
          if (saveResult.success) {
            console.log('Audio sauvegardé:', saveResult.path);
            
            setIsProcessing(true);
            try {
              const fetchedProducts = await fetchProductsFromAudio(saveResult.path);
              setProducts(fetchedProducts);
              setShowResults(true);
            } catch (err) {
              console.error('Erreur lors de la récupération des produits:', err);
            } finally {
              setIsProcessing(false);
            }
          }
        };
        
        mediaRecorderRef.current.start();
        
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
        
        setError(null);
        
        function tick() {
          if (!mounted) return;
          analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
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
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [listening]);

  const handleMicToggle = () => {
    if (listening) {
      setListening(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      setTranscript("");
      setProducts([]);
      setShowResults(false);
      setListening(true);
    }
  };

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
      position: "relative",
      padding: "20px"
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

      {!showResults ? (
        <div style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          alignItems: "center", 
          justifyContent: "center", 
          width: "100%",
          position: "relative"
        }}>
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
              zIndex: 1,
              marginBottom: "20px"
            }}
          />

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

          {transcript && (
            <div style={{
              background: "#f8f9fa",
              padding: "16px",
              borderRadius: 8,
              border: "1px solid #e9ecef",
              maxWidth: "600px",
              margin: "20px 0",
              fontSize: 14,
              color: "#555",
              textAlign: "center"
            }}>
              <strong>Transcription:</strong> {transcript}
            </div>
          )}

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

          <button
            onClick={handleMicToggle}
            disabled={isProcessing}
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
              cursor: isProcessing ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              position: "relative",
              opacity: isProcessing ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!listening && !isProcessing) {
                e.target.style.transform = "scale(1.1)";
                e.target.style.boxShadow = "0 4px 16px rgba(231, 76, 60, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!listening && !isProcessing) {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 2px 8px rgba(231, 76, 60, 0.2)";
              }
            }}
            aria-label={getText(lang, "microphone")}
          >
            <span role="img" aria-label="microphone">🎤</span>
          </button>

          <div style={{
            textAlign: "center",
            fontSize: 14,
            color: "#666",
            marginBottom: "16px"
          }}>
            {isProcessing 
              ? "Traitement en cours..." 
              : listening 
                ? getText(lang, "listening") 
                : getText(lang, "notListening")
            }
          </div>
        </div>
      ) : (
        <div style={{
          width: "100%",
          maxWidth: "800px",
          padding: "20px"
        }}>
          <h2 style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#333"
          }}>
            Produits recommandés
          </h2>
          
          {transcript && (
            <div style={{
              background: "#f8f9fa",
              padding: "16px",
              borderRadius: 8,
              border: "1px solid #e9ecef",
              marginBottom: "20px",
              fontSize: 14,
              color: "#555"
            }}>
              <strong>Votre recherche:</strong> {transcript}
            </div>
          )}

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "20px"
          }}>
            {products.map((product, index) => (
              <div key={index} style={{
                border: "1px solid #e9ecef",
                borderRadius: 8,
                padding: "16px",
                background: "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}>
                <div style={{
                  width: "100%",
                  height: "150px",
                  background: "#f8f9fa",
                  borderRadius: 4,
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px"
                }}>
                  📦
                </div>
                <h3 style={{
                  margin: "0 0 8px 0",
                  fontSize: 16,
                  color: "#333"
                }}>
                  {product.name}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#e74c3c"
                }}>
                  {product.price.toFixed(2)} €
                </p>
              </div>
            ))}
          </div>

          <div style={{
            textAlign: "center"
          }}>
            <button
              onClick={() => {
                setShowResults(false);
                setTranscript("");
                setProducts([]);
              }}
              style={{
                background: "#e74c3c",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: 6,
                fontSize: 16,
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.background = "#c0392b"}
              onMouseLeave={(e) => e.target.style.background = "#e74c3c"}
            >
              Nouvelle recherche
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 