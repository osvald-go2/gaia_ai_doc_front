import { X, Download, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { APIInterface } from './InterfaceList';
import { generateMarkdown } from './DocumentGenerator';
import { toast } from 'sonner@2.0.3';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  interfaces: APIInterface[];
  sections: any[];
}

export function DocumentPreview({ isOpen, onClose, interfaces, sections }: DocumentPreviewProps) {
  const markdownContent = generateMarkdown(interfaces, sections);

  const handleExport = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api-documentation.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Markdown 文档已导出');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    toast.success('已复制到剪贴板');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-4 md:inset-10 bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-card to-secondary/20">
              <div>
                <h2 className="text-xl text-foreground">接口文档</h2>
                <p className="text-sm text-muted-foreground">
                  共 {interfaces.length} 个接口
                </p>
              </div>
              
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Markdown Content */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="p-8 markdown-preview">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl mb-6 pb-4 border-b border-primary/20 text-primary tracking-wide">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl mt-8 mb-4 text-primary/90 tracking-wide">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="mt-6 mb-3 text-primary/80">
                          {children}
                        </h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="mt-4 mb-2 text-foreground/90">
                          {children}
                        </h4>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 text-sm text-foreground/80 leading-relaxed">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-4 ml-6 space-y-2 list-disc marker:text-primary/60">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-4 ml-6 space-y-2 list-decimal marker:text-primary/60">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-sm text-foreground/80">
                          {children}
                        </li>
                      ),
                      code: ({ inline, children, ...props }: any) =>
                        inline ? (
                          <span className="text-sm text-foreground/80">
                            {children}
                          </span>
                        ) : (
                          <code className="block p-4 bg-secondary/30 text-foreground/90 border border-border/50 text-sm overflow-x-auto mb-4 font-mono" {...props}>
                            {children}
                          </code>
                        ),
                      pre: ({ children }) => (
                        <pre className="mb-4 overflow-x-auto">
                          {children}
                        </pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/30 pl-4 my-4 text-sm text-foreground/70 bg-secondary/20 py-3">
                          {children}
                        </blockquote>
                      ),
                      table: ({ children }) => (
                        <div className="mb-6 overflow-x-auto border border-border/50 shadow-sm">
                          <table className="w-full border-collapse">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-primary/15 border-b-2 border-primary/30">
                          {children}
                        </thead>
                      ),
                      tbody: ({ children }) => (
                        <tbody className="bg-card">
                          {children}
                        </tbody>
                      ),
                      tr: ({ children }) => (
                        <tr className="border-b border-border/30 even:bg-secondary/10 hover:bg-primary/5 transition-colors">
                          {children}
                        </tr>
                      ),
                      th: ({ children }) => (
                        <th className="px-4 py-3 text-left text-sm text-primary border-r border-border/30 last:border-r-0">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-2.5 text-sm text-foreground/80 border-r border-border/20 last:border-r-0">
                          {children}
                        </td>
                      ),
                      hr: () => (
                        <hr className="my-8 border-t border-border/30" />
                      ),
                      strong: ({ children }) => (
                        <strong className="text-primary">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="text-foreground/90">
                          {children}
                        </em>
                      ),
                      a: ({ children, href }) => (
                        <a 
                          href={href} 
                          className="text-primary hover:text-primary/70 underline underline-offset-2 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {markdownContent}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-6 border-t border-border bg-secondary/20">
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary"
              >
                <Download className="w-4 h-4" />
                导出 Markdown
              </Button>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  复制内容
                </Button>
                <Button
                  onClick={onClose}
                  variant="default"
                  size="sm"
                >
                  关闭
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
