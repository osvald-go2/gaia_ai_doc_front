import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, Link as LinkIcon, Clock, Settings } from 'lucide-react';

interface URLInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
  onOpenHistory?: () => void;
  onOpenSettings?: () => void;
}

export function URLInput({ onSubmit, loading, onOpenHistory, onOpenSettings }: URLInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      {/* 左上角历史按钮 */}
      <div className="absolute top-8 left-8">
        <Button
          onClick={onOpenHistory}
          variant="outline"
          size="sm"
          className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200 shadow-sm"
        >
          <Clock className="w-4 h-4" />
          历史记录
        </Button>
      </div>

      {/* 右上角设置按钮 */}
      <div className="absolute top-8 right-8">
        <Button
          onClick={onOpenSettings}
          variant="outline"
          size="sm"
          className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200 shadow-sm"
        >
          <Settings className="w-4 h-4" />
          系统设置
        </Button>
      </div>

      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 mb-6">
            <LinkIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl mb-4 text-foreground">AI接口生成器</h1>
          <p className="text-muted-foreground text-lg">
            输入 LARK PRD 文档链接，自动解析并生成后端接口配置
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Input
              type="url"
              placeholder="https://ecnjtt87q4e5.feishu.cn/wiki/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-14 bg-card border-border text-foreground placeholder:text-muted-foreground pr-4"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={!url.trim() || loading}
            className="relative w-full h-14 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary/90 hover:to-primary/85 text-primary-foreground overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
          >
            {/* 光效动画背景 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            
            {/* 边缘光晕 */}
            <div className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]" />
            
            {/* 按钮内容 */}
            <span className="relative z-10 flex items-center justify-center">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  正在解析文档...
                </>
              ) : (
                <>
                  <span className="mr-2">开始解析</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </Button>
        </form>

        <div className="mt-12 p-6 bg-card border border-border rounded-lg">
          <h3 className="text-sm mb-3 text-primary">示例链接</h3>
          <button
            onClick={() => setUrl('https://ecnjtt87q4e5.feishu.cn/wiki/O2NjwrNDCiRDqMkWJyfcNwd5nXe')}
            className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
            disabled={loading}
          >
            https://ecnjtt87q4e5.feishu.cn/wiki/O2NjwrNDCiRDqMkWJyfcNwd5nXe
          </button>
        </div>
      </div>
    </div>
  );
}
