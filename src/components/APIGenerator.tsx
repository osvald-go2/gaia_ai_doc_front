import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Check, Loader2, AlertCircle, Sparkles, RotateCw, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { APIInterface } from './InterfaceList';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area@1.2.3';

interface APIGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  interfaces: APIInterface[];
}

type GenerationStatus = 'pending' | 'generating' | 'success' | 'error';

interface InterfaceGenerationState {
  id: string;
  status: GenerationStatus;
  progress: number;
  message?: string;
  platform?: string;
}

export function APIGenerator({ isOpen, onClose, interfaces }: APIGeneratorProps) {
  const [generationStates, setGenerationStates] = useState<InterfaceGenerationState[]>([]);
  const [currentStep, setCurrentStep] = useState<'preparing' | 'generating' | 'completed'>('preparing');
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // 初始化生成状态
      setGenerationStates(
        interfaces.map((api) => ({
          id: api.id,
          status: 'pending',
          progress: 0,
        }))
      );
      setCurrentStep('preparing');
      setOverallProgress(0);
      
      // 开始生成流程
      setTimeout(() => {
        startGeneration();
      }, 500);
    }
  }, [isOpen, interfaces]);

  const startGeneration = async () => {
    setCurrentStep('generating');
    
    // 逐个生成接口
    for (let i = 0; i < interfaces.length; i++) {
      const api = interfaces[i];
      
      // 开始生成当前接口
      setGenerationStates((prev) =>
        prev.map((state) =>
          state.id === api.id
            ? { ...state, status: 'generating', progress: 0 }
            : state
        )
      );

      // 模拟生成过程
      await simulateGeneration(api.id, api.name);
      
      // 更新总体进度
      setOverallProgress(((i + 1) / interfaces.length) * 100);
    }

    setCurrentStep('completed');
  };

  const simulateGeneration = async (id: string, name: string): Promise<void> => {
    // 阶段1: 分析接口配置 (30%)
    await updateProgress(id, 30, '分析接口配置...');
    await new Promise((resolve) => setTimeout(resolve, 600));

    // 阶段2: 生成API代码 (60%)
    await updateProgress(id, 60, '生成API代码...');
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 阶段3: 同步到远端 (90%)
    await updateProgress(id, 90, '同步到远端平台...');
    await new Promise((resolve) => setTimeout(resolve, 700));

    // 完成
    const platforms = ['Apifox', 'Postman', 'Swagger', 'YApi'];
    const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
    
    // 模拟偶尔的失败
    const shouldFail = Math.random() < 0.1; // 10% 失败率
    
    if (shouldFail) {
      setGenerationStates((prev) =>
        prev.map((state) =>
          state.id === id
            ? {
                ...state,
                status: 'error',
                progress: 100,
                message: '网络连接超时，请重试',
              }
            : state
        )
      );
    } else {
      setGenerationStates((prev) =>
        prev.map((state) =>
          state.id === id
            ? {
                ...state,
                status: 'success',
                progress: 100,
                message: `已同步到 ${randomPlatform}`,
                platform: randomPlatform,
              }
            : state
        )
      );
    }
  };

  const updateProgress = async (id: string, progress: number, message: string) => {
    setGenerationStates((prev) =>
      prev.map((state) =>
        state.id === id ? { ...state, progress, message } : state
      )
    );
  };

  const handleClose = () => {
    if (currentStep === 'generating') {
      // 正在生成时询问确认
      if (confirm('接口正在生成中，确定要关闭吗？')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const successCount = generationStates.filter((s) => s.status === 'success').length;
  const errorCount = generationStates.filter((s) => s.status === 'error').length;

  const handleRetry = async (id: string) => {
    const api = interfaces.find((i) => i.id === id);
    if (!api) return;

    // 重置状态
    setGenerationStates((prev) =>
      prev.map((state) =>
        state.id === id
          ? { ...state, status: 'generating', progress: 0, message: undefined }
          : state
      )
    );

    // 重新生成
    await simulateGeneration(id, api.name);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* 主弹窗 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[80vh] bg-card rounded-xl border border-border shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* 顶部装饰光晕 */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-b from-card to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shadow-sm">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-foreground">生成接口到远端</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {currentStep === 'preparing' && '准备生成...'}
                    {currentStep === 'generating' && `正在生成 ${generationStates.filter(s => s.status === 'generating').length > 0 ? generationStates.findIndex(s => s.status === 'generating') + 1 : interfaces.length} / ${interfaces.length}`}
                    {currentStep === 'completed' && `完成 ${successCount} 个，失败 ${errorCount} 个`}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* 总体进度 */}
            <div className="px-6 py-4 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground">总体进度</span>
                <span className="text-sm text-primary font-medium">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.3 }}
                >
                  {/* 动态光效 */}
                  {currentStep === 'generating' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  )}
                </motion.div>
              </div>
            </div>

            {/* 接口列表 */}
            <ScrollAreaPrimitive.Root className="flex-1 overflow-hidden">
              <ScrollAreaPrimitive.Viewport className="h-full w-full">
                <div className="p-6 space-y-3">
                  {interfaces.map((api, index) => {
                    const state = generationStates.find((s) => s.id === api.id);
                    if (!state) return null;

                    return (
                      <motion.div
                        key={api.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          state.status === 'success'
                            ? 'bg-green-500/5 border-green-500/30'
                            : state.status === 'error'
                            ? 'bg-red-500/5 border-red-500/30'
                            : state.status === 'generating'
                            ? 'bg-primary/5 border-primary/30 shadow-sm'
                            : 'bg-secondary/30 border-border'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* 状态图标 */}
                          <div className="flex-shrink-0 mt-0.5">
                            {state.status === 'pending' && (
                              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                            )}
                            {state.status === 'generating' && (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              >
                                <Loader2 className="w-5 h-5 text-primary" />
                              </motion.div>
                            )}
                            {state.status === 'success' && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                              >
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                            {state.status === 'error' && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                              >
                                <AlertCircle className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </div>

                          {/* 接口信息 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-foreground font-medium truncate">
                                {api.name}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded border ${
                                api.method === 'GET' ? 'text-green-400 bg-green-400/10 border-green-400/30' :
                                api.method === 'POST' ? 'text-blue-400 bg-blue-400/10 border-blue-400/30' :
                                api.method === 'PUT' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
                                'text-red-400 bg-red-400/10 border-red-400/30'
                              }`}>
                                {api.method}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{api.endpoint}</p>
                            
                            {/* 进度条 */}
                            {state.status === 'generating' && (
                              <div className="space-y-1">
                                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${state.progress}%` }}
                                    transition={{ duration: 0.3 }}
                                  />
                                </div>
                                {state.message && (
                                  <p className="text-xs text-primary flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    {state.message}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {/* 成功/失败消息 */}
                            {state.status === 'success' && state.message && (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                ✓ {state.message}
                              </p>
                            )}
                            {state.status === 'error' && (
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-red-600 dark:text-red-400">
                                  ✕ {state.message}
                                </p>
                                <Button
                                  onClick={() => handleRetry(api.id)}
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-2 text-xs border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-400"
                                >
                                  <RotateCw className="w-3 h-3 mr-1" />
                                  重试
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollAreaPrimitive.Viewport>
              
              <ScrollAreaPrimitive.ScrollAreaScrollbar
                orientation="vertical"
                className="flex touch-none select-none transition-all w-2.5 border-l border-l-transparent p-px"
              >
                <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-primary/30" />
              </ScrollAreaPrimitive.ScrollAreaScrollbar>
            </ScrollAreaPrimitive.Root>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-gradient-to-t from-card to-transparent">
              {currentStep === 'completed' ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {errorCount > 0 ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                          <p className="text-sm text-foreground font-medium">部分接口生成失败</p>
                          <p className="text-xs text-muted-foreground">
                            成功 {successCount} 个，失败 {errorCount} 个
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center"
                        >
                          <Check className="w-5 h-5 text-green-500" />
                        </motion.div>
                        <div>
                          <p className="text-sm text-foreground font-medium">全部生成成功！</p>
                          <p className="text-xs text-muted-foreground">
                            {successCount} 个接口已同步到远端平台
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <Button
                        onClick={() => window.open('https://gaia.example.com', '_blank')}
                        className="gap-2 bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 relative overflow-hidden group"
                        style={{ color: 'var(--primary-foreground, white)' }}
                      >
                        {/* 脉冲动画背景 */}
                        <motion.div
                          className="absolute inset-0 bg-primary/20"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                        {/* 内容 */}
                        <ExternalLink className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                        <span className="relative z-10">前往 GAIA 查看</span>
                      </Button>
                    </motion.div>
                    <Button
                      onClick={onClose}
                      className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                      style={{ color: 'var(--primary-foreground, white)' }}
                    >
                      {errorCount > 0 ? '关闭' : '完成'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-5 h-5 text-primary" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground">
                      正在生成接口，请勿关闭窗口...
                    </p>
                  </div>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    disabled={currentStep === 'generating'}
                  >
                    取消
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
