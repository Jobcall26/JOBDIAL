import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';

export default function WelcomeAnimation() {
  const { user } = useAuth();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }} // Animation plus rapide
      key="welcome-animation" // Clé unique pour aider AnimatePresence à tracker l'élément
    >
      <motion.div 
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }} // Plus rapide
      >
        <motion.div 
          className="text-center mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }} // Plus rapide
        >
          <motion.div 
            className="gradient-bg text-white text-4xl md:text-6xl font-bold py-4 px-6 rounded-xl inline-block mb-3"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, 0], 
            }}
            transition={{ 
              duration: 1.0, 
              ease: "easeInOut", 
              times: [0, 0.5, 1],
              delay: 0.4,
            }}
          >
            <span className="tracking-wide">JOBDIAL</span>
          </motion.div>
          
          <motion.div
            className="text-white text-xl md:text-2xl font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              Bienvenue, 
            </motion.span>
            <motion.span 
              className="text-primary font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {user?.username || 'Utilisateur'}
            </motion.span>
            <motion.span 
              className="text-secondary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: [1, 1.2, 1] }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              !
            </motion.span>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-4 text-center text-white text-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.3 }}
        >
          {user?.role === 'admin' ? (
            "Centre d'administration du CRM"
          ) : (
            "Centre d'appels et gestion des contacts"
          )}
        </motion.div>

        {/* Particles animées autour du logo - réduites et plus rapides */}
        <motion.div className="absolute inset-0 -z-10 overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                i % 2 === 0 ? 'bg-primary w-2 h-2' : 'bg-secondary w-1 h-1'
              } opacity-60`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 80 - 40],
                y: [0, Math.random() * 80 - 40],
                opacity: [0.6, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 1.5 + Math.random() * 1.5, // Plus rapide
                delay: Math.random() * 0.5, // Délai plus court
                repeat: 1, // Une seule répétition
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
