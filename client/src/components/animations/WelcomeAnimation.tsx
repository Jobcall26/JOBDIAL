import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function WelcomeAnimation() {
  const { user } = useAuth();
  // Nous n'avons plus besoin de ce state car c'est le composant parent qui gère l'affichage/masquage
  // const [show, setShow] = useState(true);

  // Nous n'avons plus besoin de cette fonction car c'est le composant parent qui gère la temporisation
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setShow(false);
  //   }, 3000);
  //
  //   return () => clearTimeout(timer);
  // }, []);

  // if (!show) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }} // Animation plus lente
    >
      <motion.div 
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 25 }} // Ressort plus lent et plus amorti
      >
        <motion.div 
          className="text-center mb-8"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }} // Plus lent avec un délai plus long
        >
          <motion.div 
            className="gradient-bg text-white text-4xl md:text-6xl font-bold py-5 px-8 rounded-xl inline-block mb-6"
            animate={{ 
              scale: [1, 1.05, 1, 1.05, 1],
              rotate: [0, 3, 0, -3, 0], // Rotation plus légère
            }}
            transition={{ 
              duration: 3.0, // Beaucoup plus lent
              ease: "easeInOut", 
              times: [0, 0.25, 0.5, 0.75, 1],
              delay: 1.2,
              repeat: Infinity, // Répéter l'animation indéfiniment
              repeatDelay: 2, // Attendre 2 secondes entre chaque répétition
            }}
          >
            <span className="tracking-wide">JOBDIAL</span>
          </motion.div>
          
          <motion.div
            className="text-white text-xl md:text-2xl font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.8 }} // Plus lent
          >
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.4, duration: 0.5 }} // Espacé davantage
            >
              Bienvenue, 
            </motion.span>
            <motion.span 
              className="text-primary font-bold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.0, duration: 0.5, type: "spring" }} // Effet de ressort
            >
              {user?.username || 'Utilisateur'}
            </motion.span>
            <motion.span 
              className="text-secondary"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: [1, 1.5, 1] }} // Animation plus expressive
              transition={{ delay: 3.5, duration: 0.8 }}
            >
              !
            </motion.span>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-8 text-center text-white text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.0, duration: 0.8 }} // Plus lent
        >
          {user?.role === 'admin' ? (
            "Centre d'administration du CRM"
          ) : (
            "Centre d'appels et gestion des contacts"
          )}
        </motion.div>

        <motion.div 
          className="absolute -bottom-16 left-0 right-0 text-center text-white text-sm opacity-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0.4, 0.8] }} // Animation de pulsation pour le texte
          transition={{ 
            delay: 5.0, 
            duration: 2.0,
            times: [0, 0.3, 0.6, 1],
            repeat: Infinity, // Répéter l'animation indéfiniment
          }}
        >
          Chargement de votre espace...
        </motion.div>

        {/* Particles animées autour du logo - plus nombreuses et plus variées */}
        <motion.div className="absolute inset-0 -z-10 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                i % 3 === 0 ? 'bg-primary w-3 h-3' : 
                i % 3 === 1 ? 'bg-secondary w-2 h-2' : 
                'bg-white w-1 h-1'
              } opacity-70`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 150 - 75],
                y: [0, Math.random() * 150 - 75],
                opacity: [0.7, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4, // Plus lent
                delay: Math.random() * 2, // Délai aléatoire pour une apparition plus naturelle
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
