
import { motion, useAnimate } from 'framer-motion';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function WelcomeAnimation() {
  const [scope, animate] = useAnimate();
  const { user } = useAuth();
  const primaryColor = !user ? '#4A90E2' : (user?.role === 'agent' ? '#00E676' : '#2196F3');
  const secondaryColor = !user ? '#FF66C4' : (user?.role === 'agent' ? '#FFC107' : '#FF4081');
  const tertiaryColor = !user ? '#9C27B0' : (user?.role === 'agent' ? '#FF5722' : '#673AB7');

  useEffect(() => {
    const timer = setTimeout(() => {
      animate(scope.current, { opacity: 0 }, { duration: 0.5 })
        .then(() => {
          document.dispatchEvent(new Event('welcomeAnimationComplete'));
          const element = document.querySelector('.welcome-animation-container');
          if (element) {
            (element as HTMLElement).style.display = 'none';
            (element as HTMLElement).style.pointerEvents = 'none';
          }
        });
    }, 6000);

    // Assurer que l'animation ne bloque pas l'interaction
    const element = document.querySelector('.welcome-animation-container');
    if (element) {
      (element as HTMLElement).style.pointerEvents = 'none';
    }

    return () => {
      clearTimeout(timer);
      document.dispatchEvent(new Event('welcomeAnimationComplete'));
    };
  }, [animate]);

  useEffect(() => {
    const element = document.querySelector('.welcome-animation-container');
    if (element) {
      (element as HTMLElement).style.zIndex = '9999';
    }
  }, []);

  if (!user) {
    return (
      <motion.div
        ref={scope}
        className="welcome-animation-container fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(circle at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,1) 100%)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative w-full h-full">
          {/* Particules colorées */}
          {[...Array(150)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2"
              style={{
                background: i % 3 === 0 ? primaryColor : i % 3 === 1 ? secondaryColor : tertiaryColor,
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(1px)',
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
                x: [0, Math.random() * 300 - 150],
                y: [0, Math.random() * 300 - 150],
                rotate: [0, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Logo principal animé */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1.5, type: "spring" }}
          >
            <motion.div
              className="text-8xl font-black mb-8"
              animate={{
                color: [primaryColor, secondaryColor, tertiaryColor],
                textShadow: [
                  `0 0 20px ${primaryColor}80`,
                  `0 0 40px ${secondaryColor}80`,
                  `0 0 60px ${tertiaryColor}80`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              JOBDIAL
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <motion.div
                className="text-2xl font-light"
                style={{ color: secondaryColor }}
                animate={{
                  color: [secondaryColor, tertiaryColor, primaryColor],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                Centre d'Appels Nouvelle Génération
              </motion.div>

              <motion.div
                className="h-1 mt-6 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, ${tertiaryColor})`,
                  backgroundSize: '200% 100%',
                }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ 
                  width: '100%',
                  opacity: 1,
                  backgroundPosition: ['0% 0%', '100% 0%'],
                }}
                transition={{ 
                  width: { duration: 1, delay: 1.5 },
                  opacity: { duration: 0.5, delay: 1.5 },
                  backgroundPosition: { duration: 3, repeat: Infinity },
                }}
              />
            </motion.div>
          </motion.div>

          {/* Textes qui apparaissent avec effet de glissement */}
          <div className="absolute bottom-20 left-0 right-0 text-center">
            {[
              { text: "Innovation", color: primaryColor },
              { text: "Performance", color: secondaryColor },
              { text: "Excellence", color: tertiaryColor }
            ].map((item, index) => (
              <motion.div
                key={item.text}
                className="text-2xl font-semibold my-2"
                style={{ color: item.color }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 2 + (index * 0.3),
                  type: "spring",
                  stiffness: 100
                }}
              >
                {item.text}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={scope}
      className="welcome-animation-container fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: `radial-gradient(circle at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,1) 100%)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onAnimationComplete={() => {
        document.dispatchEvent(new Event('welcomeAnimationComplete'));
      }}
    >
      {user.role === 'agent' ? (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Effet de particules pour agent */}
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2"
              style={{
                background: i % 3 === 0 ? primaryColor : i % 3 === 1 ? secondaryColor : tertiaryColor,
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(1px)',
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 0.8, 0],
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

          <div className="relative z-10 text-center space-y-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: "spring" }}
            >
              <div className="w-32 h-32 mx-auto rounded-full relative overflow-hidden">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `conic-gradient(from 0deg, ${primaryColor}, ${secondaryColor}, ${tertiaryColor}, ${primaryColor})`,
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <div className="absolute inset-1 rounded-full bg-black flex items-center justify-center">
                  <motion.div
                    className="text-5xl font-bold"
                    animate={{
                      color: [primaryColor, secondaryColor, tertiaryColor],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    JD
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.h1
                className="text-5xl font-bold"
                animate={{
                  color: [primaryColor, secondaryColor, tertiaryColor],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Bienvenue {user.username}
              </motion.h1>

              <div className="space-y-3">
                {[
                  "Connexion sécurisée établie",
                  "Centre d'appel activé",
                  "Poste agent opérationnel"
                ].map((message, index) => (
                  <motion.div
                    key={message}
                    className="text-xl font-light"
                    style={{ color: index === 0 ? primaryColor : index === 1 ? secondaryColor : tertiaryColor }}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 + (index * 0.3) }}
                  >
                    {message}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Grille animée pour admin */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, ${primaryColor}15 1px, transparent 1px),
                linear-gradient(to bottom, ${primaryColor}15 1px, transparent 1px)
              `,
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
            <div className="w-40 h-40 rounded-full relative overflow-hidden">
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `conic-gradient(from 0deg, ${primaryColor}, ${secondaryColor}, ${tertiaryColor}, ${primaryColor})`,
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <div className="absolute inset-2 rounded-full bg-black/90 flex items-center justify-center">
                <motion.div
                  className="text-6xl font-bold"
                  animate={{
                    color: [primaryColor, secondaryColor, tertiaryColor],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  JD
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-20 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.h1
              className="text-5xl font-bold mb-6"
              animate={{
                color: [primaryColor, secondaryColor, tertiaryColor],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Centre de Supervision JOBDIAL
            </motion.h1>
            <motion.p
              className="text-2xl"
              style={{ color: secondaryColor }}
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
