
import { motion, useAnimate } from 'framer-motion';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function WelcomeAnimation() {
  const [scope, animate] = useAnimate();
  const { user } = useAuth();
  const primaryColor = !user ? '#4A90E2' : (user?.role === 'agent' ? '#00E676' : '#2196F3');

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
    }, 6000);

    return () => clearTimeout(timer);
  }, [animate]);

  if (!user) {
    return (
      <motion.div
        ref={scope}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black welcome-animation-container overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative w-full h-full">
          {/* Particules d'arrière-plan */}
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: `rgba(74, 144, 226, ${Math.random() * 0.5 + 0.5})`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
                x: [0, Math.random() * 200 - 100],
                y: [0, Math.random() * 200 - 100],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Cercles pulsants */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`circle-${i}`}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{
                borderColor: primaryColor,
                width: `${(i + 1) * 100}px`,
                height: `${(i + 1) * 100}px`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}

          {/* Logo animé */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.div
              className="text-8xl font-bold mb-8"
              animate={{
                textShadow: [
                  '0 0 20px rgba(74, 144, 226, 0.5)',
                  '0 0 40px rgba(74, 144, 226, 0.8)',
                  '0 0 20px rgba(74, 144, 226, 0.5)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              JOBDIAL
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <motion.div
                className="text-2xl text-blue-400 font-light"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Centre d'Appels Nouvelle Génération
              </motion.div>

              {/* Ligne de progression */}
              <motion.div
                className="h-0.5 bg-blue-500 mt-4"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, delay: 2 }}
              />
            </motion.div>
          </motion.div>

          {/* Textes qui apparaissent */}
          <div className="absolute bottom-20 left-0 right-0 text-center">
            {[
              "Innovation",
              "Performance",
              "Excellence"
            ].map((text, index) => (
              <motion.div
                key={text}
                className="text-xl text-blue-300 my-2"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.5 + (index * 0.3) }}
              >
                {text}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Reste du code pour les animations admin/agent...
  return (
    <motion.div
      ref={scope}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black welcome-animation-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {user.role === 'agent' ? (
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
          </div>
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

          <motion.div
            className="absolute bottom-20 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
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
              transition={{ delay: 1.5 }}
            >
              Interface administrateur initialisée
            </motion.p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
