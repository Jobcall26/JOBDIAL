import { motion, useAnimate } from 'framer-motion';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Activity, BarChart2, Users, Phone } from 'lucide-react';

export default function WelcomeAnimation() {
  const [scope, animate] = useAnimate();
  const { user } = useAuth();
  const isAgent = user?.role === 'agent';
  const primaryColor = isAgent ? '#00E676' : '#2196F3';

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
    }, 5500);

    return () => clearTimeout(timer);
  }, [animate]);

  const adminIcons = [
    { Icon: Activity, label: "Supervision", delay: 2 },
    { Icon: BarChart2, label: "Statistiques", delay: 2.3 },
    { Icon: Users, label: "Agents", delay: 2.6 },
    { Icon: Phone, label: "Appels", delay: 2.9 }
  ];

  return (
    <motion.div
      ref={scope}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black welcome-animation-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {isAgent ? (
        <>
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: primaryColor,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${primaryColor}15 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="relative z-10 text-center space-y-6">
            <motion.div
              className="mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 1, times: [0, 0.6, 1] }}
            >
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-white/30 flex items-center justify-center">
                <motion.div
                  className="text-4xl font-bold"
                  animate={{
                    textShadow: [
                      `0 0 20px ${primaryColor}`,
                      `0 0 40px ${primaryColor}`,
                      `0 0 20px ${primaryColor}`,
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  JD
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              className="space-y-2"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <motion.h1
                className="text-5xl font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, white, ${primaryColor})`,
                }}
              >
                Bienvenue {user?.username}
              </motion.h1>
            </motion.div>
            <div className="space-y-3">
              {[
                "Connexion sécurisée établie",
                "Centre d'appel activé",
                "Poste agent opérationnel"
              ].map((message, index) => (
                <motion.div
                  key={message}
                  className="text-xl font-light"
                  style={{ color: primaryColor }}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.5 + (index * 0.3) }}
                >
                  {message}
                </motion.div>
              ))}
            </div>
            <motion.div
              className="mt-8 text-neutral-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.8] }}
              transition={{ delay: 3, duration: 1.5 }}
            >
              En attente d'appels - Prêt à commencer
            </motion.div>
          </div>
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, 
                ${primaryColor}10 25%, 
                ${primaryColor}10 26%, 
                transparent 27%, transparent 74%, 
                ${primaryColor}10 75%, 
                ${primaryColor}10 76%, 
                transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, 
                ${primaryColor}10 25%, 
                ${primaryColor}10 26%, 
                transparent 27%, transparent 74%, 
                ${primaryColor}10 75%, 
                ${primaryColor}10 76%, 
                transparent 77%, transparent)
              `,
              backgroundSize: '50px 50px',
            }}
            animate={{
              scale: [1, 1.2],
              opacity: [0.3, 0.1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, ${primaryColor}15 1px, transparent 1px),
                               linear-gradient(to bottom, ${primaryColor}15 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
            animate={{
              scale: [1, 1.1],
              opacity: [0.1, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          <motion.div
            className="absolute"
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{ duration: 1.5, times: [0, 0.7, 1] }}
          >
            <div className="w-32 h-32 rounded-full border-4 border-white/30 flex items-center justify-center bg-black/50">
              <motion.div
                className="text-6xl font-bold"
                animate={{
                  textShadow: [
                    `0 0 20px ${primaryColor}`,
                    `0 0 40px ${primaryColor}`,
                    `0 0 20px ${primaryColor}`,
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                JD
              </motion.div>
            </div>
          </motion.div>

          {adminIcons.map(({ Icon, label, delay }, index) => (
            <motion.div
              key={index}
              className="absolute flex items-center gap-2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: Math.cos(index * (Math.PI / 2)) * 150,
                y: Math.sin(index * (Math.PI / 2)) * 150,
              }}
              transition={{ delay, duration: 0.5 }}
            >
              <Icon className="w-8 h-8" style={{ color: primaryColor }} />
              <span className="text-sm font-medium">{label}</span>
            </motion.div>
          ))}

          <motion.div
            className="absolute bottom-20 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.5 }}
          >
            <motion.h1
              className="text-4xl font-bold mb-4"
              animate={{
                color: [primaryColor, '#fff', primaryColor],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Centre de Supervision JOBDIAL
            </motion.h1>
            <motion.p
              className="text-lg text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4 }}
            >
              Interface administrateur initialisée
            </motion.p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}