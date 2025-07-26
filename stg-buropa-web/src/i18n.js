export const translations = {
  fr: {
    selectLanguage: "Sélectionner la langue",
    enterName: "Entrez votre nom",
    namePlaceholder: "Votre nom",
    continue: "Continuer",
    back: "Retour",
    microphone: "Microphone",
    listening: "Écoute en cours...",
    notListening: "Cliquez pour écouter",
    micPermissionError: "Autorisation microphone requise",
    micNotSupported: "Microphone non supporté"
  },
  en: {
    selectLanguage: "Select language",
    enterName: "Enter your name",
    namePlaceholder: "Your name",
    continue: "Continue",
    back: "Back",
    microphone: "Microphone",
    listening: "Listening...",
    notListening: "Click to listen",
    micPermissionError: "Microphone permission required",
    micNotSupported: "Microphone not supported"
  },
  ar: {
    selectLanguage: "اختر اللغة",
    enterName: "أدخل اسمك",
    namePlaceholder: "اسمك",
    continue: "متابعة",
    back: "رجوع",
    microphone: "ميكروفون",
    listening: "أستمع...",
    notListening: "انقر للاستماع",
    micPermissionError: "إذن الميكروفون مطلوب",
    micNotSupported: "الميكروفون غير مدعوم"
  }
};

export const getText = (lang, key) => {
  return translations[lang]?.[key] || translations.en[key] || key;
}; 