import { FileText, Code2, ChevronLeft, ChevronRight } from 'lucide-react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area@1.2.3';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface DocumentSection {
  id: string;
  title: string;
  content: string;
  isAPI: boolean;
}

interface DocumentPanelProps {
  sections: DocumentSection[];
  highlightedSection?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onSectionClick?: (sectionId: string) => void;
}

export function DocumentPanel({ sections, highlightedSection, isCollapsed, onToggleCollapse, onSectionClick }: DocumentPanelProps) {
  return (
    <div className="h-full flex flex-col bg-card border-r border-border relative shadow-sm">
      {/* 右侧微妙光晕 */}
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      
      {/* Collapsed State */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col items-center py-4 cursor-pointer hover:bg-primary/5 transition-all duration-200"
            onClick={onToggleCollapse}
          >
            <div className="h-10 w-10 rounded flex items-center justify-center hover:bg-primary/10 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10">
              <ChevronRight className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="text-2xl text-primary font-medium" style={{ writingMode: 'vertical-rl' }}>
                文档
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
            </div>
            <FileText className="w-5 h-5 text-primary/40" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded State */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col"
          >
            <div className="p-3 sm:p-4 md:p-4 border-b border-border flex items-center justify-between bg-gradient-to-b from-card to-transparent">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary drop-shadow-sm" />
                <h2 className="text-foreground">文档内容</h2>
              </div>
              <Button
                onClick={onToggleCollapse}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-primary/10 transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>

      <ScrollAreaPrimitive.Root className="relative flex-1 overflow-hidden">
        <ScrollAreaPrimitive.Viewport className="h-full w-full">
          <div className="p-3 sm:p-4 md:p-6 space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              id={`doc-${section.id}`}
              onClick={() => section.isAPI && onSectionClick?.(section.id)}
              className={`rounded-lg border transition-all duration-300 ${
                highlightedSection === section.id
                  ? 'bg-gradient-to-br from-card to-card/80 border-primary shadow-lg shadow-primary/20'
                  : 'bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card/80 hover:shadow-md'
              } ${section.isAPI ? 'cursor-pointer' : ''}`}
            >
              {/* 文档标题栏 */}
              <div className={`px-3 sm:px-4 md:px-6 py-4 border-b flex items-center justify-between ${
                highlightedSection === section.id
                  ? 'border-primary/30 bg-gradient-to-r from-primary/10 to-transparent'
                  : 'border-border/30'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-6 rounded-full ${
                    section.isAPI ? 'bg-primary shadow-sm shadow-primary/50' : 'bg-muted-foreground/30'
                  }`} />
                  <h3 className={`text-foreground tracking-wide ${
                    section.isAPI ? 'text-primary' : ''
                  }`}>
                    {section.title}
                  </h3>
                </div>
                {section.isAPI && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary rounded-md border border-primary/40 shadow-sm">
                    <Code2 className="w-3.5 h-3.5" />
                    API
                  </span>
                )}
              </div>

              {/* 文档内容 */}
              <div className="px-3 sm:px-4 md:px-6 py-5">
                {/* API 接口展示图片 */}
                {section.isAPI && (
                  <div className="mb-6">
                    <div className="relative rounded-lg overflow-hidden border border-primary/20 bg-card/50">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1748609160056-7b95f30041f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwY2hhcnQlMjBkYXNoYm9hcmR8ZW58MXx8fHwxNzYyNTMwMzM5fDA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="API 数据图表示例"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="text-xs text-white/90">接口数据示例</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="prose prose-sm prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words m-0">
                    {section.content.split('\n\n').map((paragraph, idx) => (
                      <span key={idx} className="block mb-4 last:mb-0">
                        {paragraph}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              {/* 底部装饰线 */}
              {highlightedSection === section.id && (
                <div className="h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              )}
            </div>
          ))}
          </div>
        </ScrollAreaPrimitive.Viewport>
        
        {/* 自定义滚动条样式 - 悬停时显示 */}
        <ScrollAreaPrimitive.ScrollAreaScrollbar
          orientation="vertical"
          className="flex touch-none select-none transition-all w-2.5 border-l border-l-transparent p-px hover:w-3.5 duration-200 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0"
        >
          <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-primary/30 hover:bg-primary/50 transition-colors duration-200" />
        </ScrollAreaPrimitive.ScrollAreaScrollbar>
        
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
