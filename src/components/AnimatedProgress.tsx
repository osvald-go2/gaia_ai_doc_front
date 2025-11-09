import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface AnimatedProgressProps {
  value: number;
  className?: string;
}

export function AnimatedProgress({ value, className = '' }: AnimatedProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const [glowPosition, setGlowPosition] = useState(0);
  
  useEffect(() => {
    setGlowPosition(clampedValue);
  }, [clampedValue]);
  
  return (
    <div className={`relative w-full rounded-full bg-secondary overflow-hidden ${className}`}>
      {/* Inner shadow for depth - subtle for both themes */}
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.12)',
      }} />
      
      {/* Progress fill with animated stripes */}
      <motion.div
        className="relative h-full overflow-hidden rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${clampedValue}%` }}
        transition={{
          duration: 0.5,
          ease: 'easeOut',
        }}
      >
        {/* Base gradient with primary color - adapts to theme */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              linear-gradient(
                to right, 
                var(--primary), 
                color-mix(in srgb, var(--primary) 85%, white 15%)
              )
            `,
          }}
        />
        
        {/* Animated diagonal stripes */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 8px,
              rgba(0, 0, 0, 0.15) 8px,
              rgba(0, 0, 0, 0.15) 16px
            )`,
          }}
          animate={{
            x: ['0px', '32px'],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Shimmer/Shine effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)',
          }}
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay: 0.3,
          }}
        />
        
        {/* Pulse overlay for more depth */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)',
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
      
      {/* Outer glow effect - theme-aware with custom variables */}
      {clampedValue > 0 && (
        <>
          {/* Base glow */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              filter: 'blur(12px)',
              maskImage: `linear-gradient(to right, transparent ${Math.max(0, glowPosition - 20)}%, black ${glowPosition}%, transparent ${Math.min(100, glowPosition + 5)}%)`,
              WebkitMaskImage: `linear-gradient(to right, transparent ${Math.max(0, glowPosition - 20)}%, black ${glowPosition}%, transparent ${Math.min(100, glowPosition + 5)}%)`,
              background: 'var(--primary)',
              opacity: 0.3,
            }}
          />
          
          {/* Pulsing glow */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              filter: 'blur(6px)',
              maskImage: `linear-gradient(to right, transparent ${Math.max(0, glowPosition - 10)}%, black ${glowPosition}%, transparent ${Math.min(100, glowPosition + 3)}%)`,
              WebkitMaskImage: `linear-gradient(to right, transparent ${Math.max(0, glowPosition - 10)}%, black ${glowPosition}%, transparent ${Math.min(100, glowPosition + 3)}%)`,
              background: 'var(--primary)',
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}
      
      {/* Leading edge highlight */}
      {clampedValue > 0 && clampedValue < 100 && (
        <motion.div
          className="absolute top-0 bottom-0 w-1 rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
            left: `${clampedValue}%`,
            transform: 'translateX(-50%)',
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.2, 1],
          }}
          transition={{
            opacity: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      )}
    </div>
  );
}
