import { motion, useAnimate } from 'framer-motion';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function WelcomeAnimation() {
  const [scope, animate] = useAnimate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      animate(scope.current, { opacity: 0 }, { duration: 0.5 })
        .then(() => {
          document.dispatchEvent(new Event('welcomeAnimationComplete'));
        });
    }, 4500);

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
      <motion.div 
        className="absolute inset-0 opacity-20"
        initial={{ scale: 1.1 }}
        animate={{ 
          scale: 1,
          backgroundImage: "linear-gradient(0deg, transparent 24%, #0066cc 25%, #0066cc 26%, transparent 27%, transparent 74%, #0066cc 75%, #0066cc 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #0066cc 25%, #0066cc 26%, transparent 27%, transparent 74%, #0066cc 75%, #0066cc 76%, transparent 77%, transparent)",
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-6xl md:text-8xl font-bold mb-6 text-white tracking-wider"
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="text-3xl text-blue-400"
        >
          Bienvenue {user?.role === 'admin' ? 'Administrateur' : 'Agent'} {user?.username}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.5 }}
          className="text-xl text-neutral-400 space-y-2"
        >
          <div>Accès système autorisé</div>
          <div>Interface d'administration activée</div>
          <div>Tous les systèmes sont opérationnels</div>
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"
        initial={{ y: "-100%" }}
        animate={{ y: "100%" }}
        transition={{
          duration: 2,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop"
        }}
      />
    </motion.div>
  );
}