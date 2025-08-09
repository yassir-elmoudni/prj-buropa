import { dummyProducts } from './dummy.js';

export const fetchProductsFromAudio = async (audioPath) => {
  console.log("Audio reçu :", audioPath);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomProducts = dummyProducts
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 4) + 3);
      
      resolve(randomProducts);
    }, 500);
  });
};

export const saveAudioFile = async (audioBlob, filename) => {
  try {
    const url = URL.createObjectURL(audioBlob);
    console.log(`Fichier audio sauvegardé : ${filename}`);
    
    return {
      success: true,
      path: `/public/audio/${filename}`,
      url: url
    };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde audio:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 