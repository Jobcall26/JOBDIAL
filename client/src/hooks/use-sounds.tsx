import { useRef, useCallback, useEffect } from 'react';

// Types de sons disponibles dans l'application
type SoundType = 'incomingCall' | 'callEnded' | 'statusChanged' | 'error' | 'notification';

// Structure pour la génération de sons
type SoundConfig = {
  id: SoundType;
  frequency: number; // En Hz
  type: OscillatorType; // Type d'oscillateur (sine, square, sawtooth, triangle)
  duration: number; // En millisecondes
  volume: number; // 0 à 1
  pattern?: number[]; // Pattern de répétition [durée son, durée silence, durée son, ...]
};

// Configuration des différents sons
const soundConfigs: SoundConfig[] = [
  {
    id: 'incomingCall',
    frequency: 1200,
    type: 'sine',
    duration: 1000,
    volume: 0.4,
    pattern: [300, 200, 300, 700] // Sonne comme un téléphone classique
  },
  {
    id: 'callEnded',
    frequency: 800,
    type: 'sine',
    duration: 500,
    volume: 0.3
  },
  {
    id: 'statusChanged',
    frequency: 600,
    type: 'sine',
    duration: 200,
    volume: 0.2
  },
  {
    id: 'error',
    frequency: 350,
    type: 'triangle',
    duration: 800,
    volume: 0.3,
    pattern: [200, 100, 200]
  },
  {
    id: 'notification',
    frequency: 900,
    type: 'sine',
    duration: 300,
    volume: 0.2
  }
];

/**
 * Hook pour la gestion des sons de l'application.
 * Permet de jouer différents sons pour les événements (appels, notifications, etc)
 * Utilise l'API Web Audio pour générer des sons programmatiquement
 */
export function useSounds() {
  // Référence pour l'AudioContext
  const audioContextRef = useRef<AudioContext | null>(null);
  // Référence pour les oscillateurs actifs
  const activeOscillators = useRef<{ [key in SoundType]?: OscillatorNode }>({});
  // Référence pour les intervalles de pattern
  const patternIntervalsRef = useRef<{ [key in SoundType]?: number }>({});

  // Initialisation de l'AudioContext au montage du composant
  useEffect(() => {
    // L'AudioContext doit être initialisé suite à une interaction utilisateur
    // mais on prépare la référence dès le début
    return () => {
      // Clean up
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
      // Clear any active intervals
      Object.values(patternIntervalsRef.current || {}).forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, []);

  // Fonction pour arrêter un son (déclarée ici pour éviter les problèmes de référence circulaire)
  const stopSoundInternal = (soundType: SoundType) => {
    // Arrêter l'oscillateur
    if (activeOscillators.current[soundType]) {
      try {
        activeOscillators.current[soundType]!.stop();
        activeOscillators.current[soundType]!.disconnect();
        delete activeOscillators.current[soundType];
      } catch (e) {
        // Ignore errors when stopping
      }
    }
    
    // Arrêter le pattern si en cours
    if (patternIntervalsRef.current && patternIntervalsRef.current[soundType]) {
      clearInterval(patternIntervalsRef.current[soundType]);
      delete patternIntervalsRef.current[soundType];
    }
  };
  
  // Générer une note à partir d'une fréquence et d'une durée
  const generateTone = useCallback((config: SoundConfig) => {
    try {
      // Lazy initialization of AudioContext (must be triggered by user interaction)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      if (!audioContext) return;
      
      // Stop any existing oscillator for this sound type
      stopSoundInternal(config.id);
      
      // Create oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(config.volume, audioContext.currentTime);
      // Add a small fade out at the end for a smoother sound
      gainNode.gain.exponentialRampToValueAtTime(
        0.001, audioContext.currentTime + config.duration / 1000
      );
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      activeOscillators.current[config.id] = oscillator;
      
      // Schedule the stop
      setTimeout(() => {
        if (activeOscillators.current[config.id] === oscillator) {
          oscillator.stop();
          oscillator.disconnect();
          gainNode.disconnect();
          delete activeOscillators.current[config.id];
        }
      }, config.duration);
    } catch (error) {
      console.error(`Erreur lors de la génération du son ${config.id}:`, error);
    }
  }, []);

  // Jouer un pattern de son (répétition)
  const playPattern = useCallback((soundType: SoundType) => {
    const config = soundConfigs.find(s => s.id === soundType);
    if (!config || !config.pattern) return;
    
    // Clear any existing interval for this sound
    if (patternIntervalsRef.current && patternIntervalsRef.current[soundType]) {
      clearInterval(patternIntervalsRef.current[soundType]);
    }
    
    let patternIndex = 0;
    let isPlaying = true;
    
    // Play the first tone immediately
    if (isPlaying) {
      generateTone({
        ...config,
        duration: config.pattern[0]
      });
    }
    
    // Set up the interval for the pattern
    const interval = window.setInterval(() => {
      patternIndex = (patternIndex + 1) % config.pattern!.length;
      
      // If even index, play tone, otherwise silence
      if (patternIndex % 2 === 0 && isPlaying) {
        generateTone({
          ...config,
          duration: config.pattern![patternIndex]
        });
      }
      
      // End the pattern after a certain number of repetitions (e.g., 4 repetitions = 8 steps)
      if (patternIndex === 0 && patternIndex > 0) {
        clearInterval(interval);
        delete patternIntervalsRef.current![soundType];
      }
    }, config.pattern[patternIndex]);
    
    patternIntervalsRef.current![soundType] = interval as unknown as number;
    
    // Safety timeout to ensure the interval is cleared after max duration
    setTimeout(() => {
      if (patternIntervalsRef.current && patternIntervalsRef.current[soundType] === interval) {
        clearInterval(interval);
        delete patternIntervalsRef.current[soundType];
      }
    }, 10000); // Max 10 seconds for any pattern
  }, [generateTone]);

  // Jouer un son
  const playSound = useCallback((soundType: SoundType) => {
    try {
      const config = soundConfigs.find(s => s.id === soundType);
      if (!config) {
        console.error(`Configuration de son non trouvée pour ${soundType}`);
        return;
      }
      
      // Si le son a un pattern, jouer le pattern
      if (config.pattern && config.pattern.length > 0) {
        playPattern(soundType);
      } else {
        // Sinon jouer une simple tonalité
        generateTone(config);
      }
    } catch (error) {
      console.error(`Erreur lors de la lecture du son ${soundType}:`, error);
    }
  }, [generateTone, playPattern]);

  // Arrêter un son (version callback qui utilise la fonction interne)
  const stopSound = useCallback((soundType: SoundType) => {
    stopSoundInternal(soundType);
  }, []);

  // Vérifier si un son est en cours de lecture
  const isPlaying = useCallback((soundType: SoundType) => {
    return !!activeOscillators.current[soundType] || 
           !!(patternIntervalsRef.current && patternIntervalsRef.current[soundType]);
  }, []);

  return {
    playSound,
    stopSound,
    isPlaying
  };
}
