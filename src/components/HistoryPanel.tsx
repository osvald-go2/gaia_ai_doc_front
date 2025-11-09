import { Clock, Trash2, FileText, X } from 'lucide-react';
import { Button } from './ui/button';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area@1.2.3';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  timestamp: Date;
  interfaceCount: number;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
}

export function HistoryPanel({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onDeleteHistory,
  onClearHistory,
}: HistoryPanelProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[400px] p-0 bg-card border-r border-border">
        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-secondary/30 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/30 flex items-center justify-center shadow-sm">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <SheetTitle className="text-foreground">解析历史</SheetTitle>
            </div>
            <SheetDescription className="text-sm text-muted-foreground mt-2">
              共 {history.length} 条记录
            </SheetDescription>
          </SheetHeader>

          {/* Content */}
          <ScrollAreaPrimitive.Root className="relative flex-1 overflow-hidden">
            <ScrollAreaPrimitive.Viewport className="h-full w-full">
              <div className="p-4">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                      <Clock className="w-8 h-8 text-primary/50" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">暂无解析历史</p>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      解析文档后会自动保存记录
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="group p-4 bg-secondary/30 border border-border rounded-lg hover:bg-secondary/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            onClick={() => {
                              onSelectHistory(item);
                              onClose();
                            }}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                              <h4 className="text-sm text-foreground truncate">{item.title}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mb-2">
                              {item.url}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{item.interfaceCount} 个接口</span>
                              <span>·</span>
                              <span>{formatTime(item.timestamp)}</span>
                            </div>
                          </button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteHistory(item.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollAreaPrimitive.Viewport>

            <ScrollAreaPrimitive.ScrollAreaScrollbar
              orientation="vertical"
              className="flex touch-none select-none transition-all w-2.5 border-l border-l-transparent p-px hover:w-3.5 duration-200"
            >
              <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-primary/30 hover:bg-primary/50 transition-colors duration-200" />
            </ScrollAreaPrimitive.ScrollAreaScrollbar>

            <ScrollAreaPrimitive.Corner />
          </ScrollAreaPrimitive.Root>

          {/* Footer */}
          {history.length > 0 && (
            <div className="p-4 border-t border-border bg-gradient-to-t from-secondary/30 to-transparent">
              <Button
                onClick={onClearHistory}
                variant="outline"
                size="sm"
                className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清空历史记录
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
