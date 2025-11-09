import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedProgress } from './AnimatedProgress';
import { FileText, Code, Settings, Layers, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface LoadingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'loading' | 'completed' | 'error';
  error?: string;
}

const defaultSteps: LoadingStep[] = [
  {
    id: 'connecting',
    title: '连接后端服务',
    description: '正在连接到LangGraph后端...',
    icon: <Settings className="w-5 h-5" />,
    status: 'pending',
  },
  {
    id: 'creating-thread',
    title: '创建处理线程',
    description: '正在初始化工作流...',
    icon: <Layers className="w-5 h-5" />,
    status: 'pending',
  },
  {
    id: 'parsing',
    title: '解析文档内容',
    description: '正在分析飞书文档...',
    icon: <FileText className="w-5 h-5" />,
    status: 'pending',
  },
  {
    id: 'processing',
    title: '生成接口配置',
    description: '正在使用AI生成接口规范...',
    icon: <Code className="w-5 h-5" />,
    status: 'pending',
  },
  {
    id: 'complete',
    title: '处理完成',
    description: '接口配置已生成',
    icon: <CheckCircle2 className="w-5 h-5" />,
    status: 'pending',
  },
];

interface LoadingProcessEnhancedProps {
  onComplete: () => void;
  url?: string;
  error?: string | null;
}

export function LoadingProcessEnhanced({ onComplete, url, error }: LoadingProcessEnhancedProps) {
  const [steps, setSteps] = useState<LoadingStep[]>(defaultSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (error) {
      // 如果有错误，设置错误状态
      setSteps(prevSteps =>
        prevSteps.map(step =>
          step.status === 'loading'
            ? { ...step, status: 'error', error: error }
            : step
        )
      );
      return;
    }

    const totalSteps = steps.length;
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const newProgress = (completedSteps / totalSteps) * 100;
    setProgress(newProgress);

    // 找到当前正在进行的步骤
    const currentLoadingStep = steps.findIndex(step => step.status === 'loading');
    if (currentLoadingStep !== -1) {
      setCurrentStepIndex(currentLoadingStep);
    } else if (completedSteps === totalSteps) {
      // 所有步骤完成
      setTimeout(() => {
        onComplete();
      }, 500);
    }

  }, [steps, error, onComplete]);

  useEffect(() => {
    // 开始处理流程
    const startProcessing = async () => {
      const updatedSteps = [...steps];

      // 模拟处理步骤
      const stepDelays = [1000, 800, 2000, 3000, 500];

      for (let i = 0; i < updatedSteps.length; i++) {
        // 更新当前步骤为加载中
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'loading' : step.status === 'pending' ? 'pending' : step.status
        })));

        // 等待一段时间
        await new Promise(resolve => setTimeout(resolve, stepDelays[i]));

        // 标记当前步骤为完成
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index <= i ? 'completed' : index === i + 1 ? 'loading' : 'pending'
        })));
      }
    };

    // 只有当URL改变且没有错误时才开始处理
    if (url && !error) {
      startProcessing();
    }
  }, [url, error]); // 当URL改变时重新开始处理

  const getStepIcon = (step: LoadingStep) => {
    switch (step.status) {
      case 'loading':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return step.icon;
    }
  };

  const getStepColor = (step: LoadingStep) => {
    switch (step.status) {
      case 'loading':
        return 'text-primary';
      case 'completed':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-lg">
        {/* URL Display */}
        {url && (
          <div className="mb-8 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">正在处理:</p>
            <p className="text-sm font-mono text-foreground break-all">{url}</p>
          </div>
        )}

        {/* Processing Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex items-start space-x-3 p-3 rounded-lg ${
                step.status === 'loading' ? 'bg-primary/5 border border-primary/20' :
                step.status === 'error' ? 'bg-destructive/5 border border-destructive/20' :
                step.status === 'completed' ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' :
                'bg-secondary/30'
              }`}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 mt-0.5 ${getStepColor(step)}`}>
                {getStepIcon(step)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-sm ${getStepColor(step)}`}>
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
                {step.error && (
                  <p className="text-xs text-red-500 mt-2">
                    错误: {step.error}
                  </p>
                )}
              </div>

              {/* Loading indicator */}
              {step.status === 'loading' && (
                <div className="flex-shrink-0">
                  <motion.div
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <AnimatedProgress
            value={progress}
            className="h-2"
          />

          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {progress < 100 ? '正在处理中...' : '处理完成'}
            </p>
            <p className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">处理失败</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}