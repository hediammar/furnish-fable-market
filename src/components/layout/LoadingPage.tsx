import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LoadingPage: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Start loading animation
    const startTime = Date.now();
    const duration = 3000; // 3 seconds

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        setIsVisible(false);
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      }
    };

    requestAnimationFrame(updateProgress);

    return () => {
      setIsVisible(false);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-[#181511] flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-6xl md:text-8xl font-serif font-semibold tracking-widest text-white"
        >
          Meubles
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-6xl md:text-8xl font-serif font-semibold tracking-widest text-[#D4AF37] mt-2"
        >
          Karim
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 1.5, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-transparent"
        />
        <div className="absolute bottom-4 left-0 w-full text-center text-white text-sm">
          {Math.round(progress)}%
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingPage; 