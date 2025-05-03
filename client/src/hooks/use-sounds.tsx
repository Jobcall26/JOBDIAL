import { useRef, useCallback } from 'react';

// Types de sons disponibles dans l'application
type SoundType = 'incomingCall' | 'callEnded' | 'statusChanged' | 'error' | 'notification';

// Structure de base d'un son
type Sound = {
  id: SoundType;
  url: string;
  volume?: number; // 0 à 1
};

// Liste des sons disponibles
const sounds: Sound[] = [
  {
    id: 'incomingCall',
    url: 'https://cdn.freesound.org/previews/522/522627_7736283-lq.mp3',
    volume: 0.7
  },
  {
    id: 'callEnded',
    url: 'https://cdn.freesound.org/previews/243/243953_1565498-lq.mp3',
    volume: 0.5
  },
  {
    id: 'statusChanged',
    url: 'https://cdn.freesound.org/previews/264/264447_5003039-lq.mp3',
    volume: 0.3
  },
  {
    id: 'error',
    url: 'https://cdn.freesound.org/previews/274/274885_4393266-lq.mp3',
    volume: 0.6
  },
  {
    id: 'notification',
    url: 'https://cdn.freesound.org/previews/411/411642_5121236-lq.mp3',
    volume: 0.4
  }
];

/**
 * Hook pour la gestion des sons de l'application.
 * Permet de jouer différents sons pour les événements (appels, notifications, etc)
 */
export function useSounds() {
  // Références pour stocker les éléments audio
  const audioRefs = useRef<{ [key in SoundType]?: HTMLAudioElement }>({});

  // Initialisation d'un son spécifique
  const initSound = useCallback((soundType: SoundType) => {
    if (!audioRefs.current[soundType]) {
      const sound = sounds.find(s => s.id === soundType);
      if (sound) {
        const audio = new Audio(sound.url);
        audio.volume = sound.volume || 0.5;
        audioRefs.current[soundType] = audio;
      }
    }
    return audioRefs.current[soundType];
  }, []);

  // Jouer un son
  const playSound = useCallback((soundType: SoundType) => {
    try {
      let audio = audioRefs.current[soundType];
      if (!audio) {
        audio = initSound(soundType);
      }
      
      if (audio) {
        // Réinitialiser le son si déjà en lecture
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
        audio.play().catch(err => console.error(`Erreur lors de la lecture du son ${soundType}:`, err));
      }
    } catch (error) {
      console.error(`Erreur avec le son ${soundType}:`, error);
    }
  }, [initSound]);

  // Arrêter un son
  const stopSound = useCallback((soundType: SoundType) => {
    const audio = audioRefs.current[soundType];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  // Vérifier si un son est en cours de lecture
  const isPlaying = useCallback((soundType: SoundType) => {
    const audio = audioRefs.current[soundType];
    return audio ? !audio.paused : false;
  }, []);

  return {
    playSound,
    stopSound,
    isPlaying
  };
}
