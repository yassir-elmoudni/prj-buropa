import React, { useState } from "react";
import LanguageScreen from "./LanguageScreen";
import VoiceScreen from "./VoiceScreen";

function App() {
  const [userConfig, setUserConfig] = useState(null);

  if (!userConfig) {
    return <LanguageScreen onSelect={setUserConfig} />;
  }
  
  return (
    <VoiceScreen 
      lang={userConfig.lang} 
      user={{ name: userConfig.name }} 
      onBack={() => setUserConfig(null)} 
    />
  );
}

export default App; 