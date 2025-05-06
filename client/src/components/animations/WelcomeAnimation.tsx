
import { motion, useAnimate } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export default function WelcomeAnimation() {
  const [scope, animate] = useAnimate();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      animate(scope.current, { opacity: 0 }, { duration: 0.5 })
        .then(() => {
          document.dispatchEvent(new Event('welcomeAnimationComplete'));
          const element = document.querySelector('.welcome-animation-container');
          if (element) {
            (element as HTMLElement).style.display = 'none';
          }
        });
    }, 3500);
    
    return () => clearTimeout(timer);
  }, [animate]);

  return (
    <motion.div
      ref={scope}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black welcome-animation-container overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Grille de fond animée */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        initial={{ scale: 1.1 }}
        animate={{ 
          scale: 1,
          backgroundImage: "linear-gradient(0deg, transparent 24%, #0066cc 25%, #0066cc 26%, transparent 27%, transparent 74%, #0066cc 75%, #0066cc 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #0066cc 25%, #0066cc 26%, transparent 27%, transparent 74%, #0066cc 75%, #0066cc 76%, transparent 77%, transparent)",
          backgroundSize: '50px 50px'
        }}
        style={{ 
          background: '#000',
        }}
      />

      {/* Particules numériques */}
      <motion.div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>

      {/* Séquence de numérotation */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number, index) => (
            <motion.div
              key={number}
              className="w-12 h-12 flex items-center justify-center bg-blue-500/20 rounded-lg text-2xl font-bold text-blue-500"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.1,
                duration: 0.3,
                type: "spring",
                stiffness: 200
              }}
            >
              {number}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Message principal */}
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl md:text-6xl font-bold mb-4 text-white tracking-wider"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.3 }}
          >
            Bienvenue sur
          </motion.span>
        </motion.div>

        <motion.div
          className="text-5xl md:text-7xl font-bold text-blue-500 mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 1.5,
            type: "spring",
            stiffness: 200
          }}
        >
          <motion.span
            animate={{
              textShadow: [
                "0 0 10px #0066cc",
                "0 0 20px #0066cc",
                "0 0 10px #0066cc"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            JOBDIAL
          </motion.span>
        </motion.div>
      </div>

      {/* Scanner effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"
        initial={{ y: "-100%" }}
        animate={{ y: "100%" }}
        transition={{
          duration: 2,
          delay: 0.5,
          ease: "linear"
        }}
      />
    </motion.div>
  );
}
