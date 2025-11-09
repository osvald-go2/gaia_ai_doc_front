import { ArrowLeft, FileCode2, FileText, Sparkles, Zap } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  onBack: () => void;
  interfaceCount: number;
  selectedCount?: number;
  onGenerateDoc: () => void;
  onGenerateAPI?: () => void;
}

export function Header({ onBack, interfaceCount, selectedCount = 0, onGenerateDoc, onGenerateAPI }: HeaderProps) {
  return (
    <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shadow-sm relative">
      {/* 顶部微妙渐变光晕 */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>
        
        <div className="h-6 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/30 flex items-center justify-center shadow-sm">
            <FileCode2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm text-foreground">AI接口生成器</h1>
            <p className="text-xs text-muted-foreground">
              已生成 {interfaceCount} 个接口
              {selectedCount > 0 && (
                <span className="ml-2 text-primary">• 已选 {selectedCount} 个</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onGenerateAPI && (
          <Button
            onClick={onGenerateAPI}
            variant="outline"
            size="sm"
            className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 text-foreground font-medium relative overflow-hidden group shadow-sm"
            disabled={selectedCount === 0}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <Zap className="w-4 h-4 text-primary" />
            生成接口
            {selectedCount > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-xs flex items-center justify-center" style={{ color: 'var(--primary-foreground, white)' }}>
                {selectedCount}
              </span>
            )}
          </Button>
        )}
        
        <Button
          onClick={onGenerateDoc}
          variant="default"
          size="sm"
          className="gap-2 bg-primary hover:bg-primary/90 font-medium relative overflow-hidden group shadow-lg shadow-primary/20"
          style={{ color: 'var(--primary-foreground, white)' }}
          disabled={interfaceCount === 0}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          <Sparkles className="w-4 h-4" />
          生成文档
          <FileText className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
