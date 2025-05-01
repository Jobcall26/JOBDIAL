import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function WelcomeAnimation() {
  const { user } = useAuth();
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Masquer l'animation après 3 secondes
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.div 
          className="text-center mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div 
            className="gradient-bg text-white text-4xl md:text-6xl font-bold py-4 px-6 rounded-xl inline-block mb-4"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{ 
              duration: 1.5, 
              ease: "easeInOut", 
              times: [0, 0.2, 0.5, 0.8, 1],
              delay: 0.8,
            }}
          >
            <span className="tracking-wide">JOBDIAL</span>
          </motion.div>
          
          <motion.div
            className="text-white text-xl md:text-2xl font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              Bienvenue, 
            </motion.span>
            <motion.span 
              className="text-primary font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              {user?.username || 'Utilisateur'}
            </motion.span>
            <motion.span 
              className="text-secondary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              !
            </motion.span>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-8 text-center text-white text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          {user?.role === 'admin' ? (
            "Centre d'administration du CRM"
          ) : (
            "Centre d'appels et gestion des contacts"
          )}
        </motion.div>

        <motion.div 
          className="absolute -bottom-12 left-0 right-0 text-center text-white text-sm opacity-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 2.5 }}
        >
          Chargement de votre espace...
        </motion.div>

        {/* Particles animées autour du logo */}
        <motion.div className="absolute inset-0 -z-10 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary opacity-70"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0.7, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
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
