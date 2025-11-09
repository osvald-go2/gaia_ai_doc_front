import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedProgress } from './AnimatedProgress';
import { FileText, Code, Settings, Layers, CheckCircle2 } from 'lucide-react';

interface LoadingStep {
  id: string;
  title: string;
  icon: React.ReactNode;
  duration: number;
}

const steps: LoadingStep[] = [
  {
    id: 'connecting',
    title: '连接后端服务',
    icon: <Settings className="w-12 h-12" />,
    duration: 800,
  },
  {
    id: 'creating',
    title: '创建处理线程',
    icon: <Layers className="w-12 h-12" />,
    duration: 600,
  },
  {
    id: 'parsing',
    title: '解析飞书文档',
    icon: <FileText className="w-12 h-12" />,
    duration: 2000,
  },
  {
    id: 'analyzing',
    title: 'AI智能分析',
    icon: <Code className="w-12 h-12" />,
    duration: 2500,
  },
  {
    id: 'building',
    title: '生成接口配置',
    icon: <Layers className="w-12 h-12" />,
    duration: 1500,
  },
  {
    id: 'complete',
    title: '处理完成',
    icon: <CheckCircle2 className="w-12 h-12" />,
    duration: 800,
  },
];

interface LoadingProcessProps {
  onComplete: () => void;
}

export function LoadingProcess({ onComplete }: LoadingProcessProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      setTimeout(() => {
        onComplete();
      }, 500);
      return;
    }

    const currentStep = steps[currentStepIndex];
    const startTime = Date.now();
    const stepProgress = (currentStepIndex / steps.length) * 100;
    const nextStepProgress = ((currentStepIndex + 1) / steps.length) * 100;

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const stepCompletion = Math.min(elapsed / currentStep.duration, 1);
      const currentProgress = stepProgress + (nextStepProgress - stepProgress) * stepCompletion;
      setProgress(currentProgress);
    }, 16);

    // Move to next step
    const stepTimer = setTimeout(() => {
      setCurrentStepIndex((prev) => prev + 1);
    }, currentStep.duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimer);
    };
  }, [currentStepIndex, onComplete]);

  const currentStep = steps[currentStepIndex];

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        {/* Icon Area with Animation */}
        <div className="relative h-48 mb-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentStep && (
              <motion.div
                key={currentStep.id}
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0, 
                  opacity: 1,
                }}
                exit={{ 
                  scale: 0, 
                  rotate: 180, 
                  opacity: 0,
                }}
                transition={{ 
                  duration: 0.6,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                className="absolute"
              >
                <div className="relative">
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  
                  {/* Icon container */}
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-primary">
                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {currentStep.icon}
                    </motion.div>
                  </div>

                  {/* Rotating ring */}
                  <motion.div
                    className="absolute -inset-2 rounded-2xl border-2 border-primary/30"
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 100% 20%, 0 20%)',
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step Title */}
        <div className="text-center mb-8 h-16">
          <AnimatePresence mode="wait">
            {currentStep && (
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl text-foreground mb-2">
                  {currentStep.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  步骤 {currentStepIndex + 1} / {steps.length}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <AnimatedProgress 
            value={progress} 
            className="h-3"
          />
          
          {/* Step Indicators */}
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStepIndex
                    ? 'bg-primary'
                    : 'bg-secondary'
                }`}
                animate={index === currentStepIndex ? {
                  scale: [1, 1.5, 1],
                } : {}}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        {/* Processing text */}
        <motion.div
          className="mt-8 text-center text-sm text-muted-foreground"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          正在处理中，请稍候...
        </motion.div>
      </div>
    </div>
  );
}
