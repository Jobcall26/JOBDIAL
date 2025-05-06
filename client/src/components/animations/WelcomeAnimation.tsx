
import { motion, useAnimate } from 'framer-motion';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function WelcomeAnimation() {
  const [scope, animate] = useAnimate();
  const { user } = useAuth();
  const isAgent = user?.role === 'agent';

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
    }, 4500);
    
    return () => clearTimeout(timer);
  }, [animate]);

  const agentMessages = [
    "Connexion sécurisée établie",
    "Centre d'appel activé",
    "Poste agent opérationnel"
  ];

  const adminMessages = [
    "Connexion sécurisée établie",
    "Centre de commande activé",
    "Système opérationnel"
  ];

  const messages = isAgent ? agentMessages : adminMessages;

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
          backgroundImage: `linear-gradient(0deg, transparent 24%, ${isAgent ? '#00cc66' : '#0066cc'} 25%, ${isAgent ? '#00cc66' : '#0066cc'} 26%, transparent 27%, transparent 74%, ${isAgent ? '#00cc66' : '#0066cc'} 75%, ${isAgent ? '#00cc66' : '#0066cc'} 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, ${isAgent ? '#00cc66' : '#0066cc'} 25%, ${isAgent ? '#00cc66' : '#0066cc'} 26%, transparent 27%, transparent 74%, ${isAgent ? '#00cc66' : '#0066cc'} 75%, ${isAgent ? '#00cc66' : '#0066cc'} 76%, transparent 77%, transparent)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="grid grid-cols-3 gap-6 mb-16">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number, index) => (
          <motion.div
            key={number}
            className={`w-16 h-16 flex items-center justify-center ${isAgent ? 'bg-green-500/10' : 'bg-blue-500/10'} rounded-xl backdrop-blur-sm border ${isAgent ? 'border-green-500/30' : 'border-blue-500/30'}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 1, 1, 0.7],
              scale: [0.5, 1, 1, 0.95],
              boxShadow: [
                `0 0 0 ${isAgent ? 'rgba(0,204,102,0)' : 'rgba(0,102,204,0)'}`,
                `0 0 20px ${isAgent ? 'rgba(0,204,102,0.5)' : 'rgba(0,102,204,0.5)'}`,
                `0 0 40px ${isAgent ? 'rgba(0,204,102,0.3)' : 'rgba(0,102,204,0.3)'}`,
                `0 0 10px ${isAgent ? 'rgba(0,204,102,0.2)' : 'rgba(0,102,204,0.2)'}`
              ]
            }}
            transition={{
              delay: index * 0.15,
              duration: 0.6,
              times: [0, 0.3, 0.6, 1],
              ease: "easeOut"
            }}
          >
            <span className={`text-3xl font-bold ${isAgent ? 'text-green-400' : 'text-blue-400'} text-glow`}>{number}</span>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-wider"
        >
          <motion.span
            animate={{
              textShadow: [
                `0 0 10px ${isAgent ? '#00cc66' : '#0066cc'}`,
                `0 0 20px ${isAgent ? '#00cc66' : '#0066cc'}`,
                `0 0 10px ${isAgent ? '#00cc66' : '#0066cc'}`
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {isAgent ? 'Bienvenue Agent JOBDIAL' : 'Bienvenue sur JOBDIAL'}
          </motion.span>
        </motion.div>

        {messages.map((message, index) => (
          <motion.div
            key={message}
            className={`text-xl ${isAgent ? 'text-green-300' : 'text-blue-300'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 2.5 + (index * 0.3),
              duration: 0.3
            }}
          >
            {message}
          </motion.div>
        ))}

        <motion.div
          className="mt-8 text-neutral-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.8 }}
        >
          {isAgent ? 'En attente d\'appels - Prêt à commencer' : 'Aucune campagne active - Créez votre première mission'}
        </motion.div>
      </div>

      <motion.div
        className={`absolute inset-0 bg-gradient-to-b from-transparent ${isAgent ? 'via-green-500/20' : 'via-blue-500/20'} to-transparent`}
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
