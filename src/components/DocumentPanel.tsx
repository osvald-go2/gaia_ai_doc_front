import { FileText, Code2, ChevronLeft, ChevronRight, BarChart3, FileTextIcon } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentSection as DocumentSectionType } from '../utils/dataTransform';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type DocumentSection = DocumentSectionType;

interface DocumentPanelProps {
  sections: DocumentSection[];
  highlightedSection?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onSectionClick?: (sectionId: string) => void;
}

function normalizeMarkdown(text: string): string {
  let t = (text || '').replace(/\r/g, '').replace(/^\s+/gm, '');
  t = t.replace(/([^\n])\n(?=-\s)/g, '$1\n\n');
  const lines = t.split('\n');
  const normalized = lines
    .map((line) => {
      if (/\s-\s/.test(line) && !/^\s*-/.test(line)) {
        const parts = line.split(/\s-\s/);
        const firstSeg = parts[0];
        let prefix = '';
        let firstItem = firstSeg.trim();
        const idx = Math.max(firstSeg.lastIndexOf('：'), firstSeg.lastIndexOf(':'));
        if (idx !== -1) {
          prefix = firstSeg.slice(0, idx + 1).trim();
          firstItem = firstSeg.slice(idx + 1).trim();
        }
        const items = [firstItem, ...parts.slice(1).map((p) => p.trim())].filter(Boolean);
        return (prefix ? prefix + '\n' : '') + items.map((i) => '- ' + i).join('\n');
      }
      return line;
    })
    .join('\n');
  return normalized;
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
            <div className="p-3 sm:p-4 md:p-4 border-b border-border flex items-center justify-between bg-gradient-to-b from-card to-transparent flex-shrink-0">
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

            {/* Content Area - 统一滚动容器，始终可见 */}
            <ScrollArea type="hover" className="flex-1 min-h-0 w-full">
              <div className="p-3 sm:p-4 md:p-6 space-y-6 min-h-full">
                {sections.filter((s) => s.chunkId).map((section) => (
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
                    <div className={`px-3 sm:px-4 md:px-6 py-4 border-b flex items-center justify-between ${
                      highlightedSection === section.id
                        ? 'border-primary/30 bg-gradient-to-r from-primary/10 to-transparent'
                        : 'border-border/30'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-6 rounded-full ${
                          section.isAPI ? 'bg-primary shadow-sm shadow-primary/50' :
                          section.chunkType ? 'bg-blue-500 shadow-sm shadow-blue-500/50' : 'bg-muted-foreground/30'
                        }`} />
                        <h3 className={`text-foreground tracking-wide ${
                          section.isAPI ? 'text-primary' : section.chunkType ? 'text-blue-600' : ''
                        }`}>
                          {section.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {section.chunkType && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-gradient-to-br from-blue-500/20 to-blue-500/10 text-blue-600 rounded-md border border-blue-500/40 shadow-sm">
                            <FileTextIcon className="w-3.5 h-3.5" />
                            {section.chunkType === 'header_section' ? '标题' :
                             section.chunkType === 'paragraph' ? '段落' :
                             section.chunkType === 'large_text_split' ? '文本' :
                             section.chunkType === 'full_document' ? '文档' : '块'}
                          </span>
                        )}
                        {section.importanceScore && section.importanceScore > 0.7 && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-gradient-to-br from-orange-500/20 to-orange-500/10 text-orange-600 rounded-md border border-orange-500/40 shadow-sm">
                            <BarChart3 className="w-3.5 h-3.5" />
                            重要
                          </span>
                        )}
                        {section.isAPI && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary rounded-md border border-primary/40 shadow-sm">
                            <Code2 className="w-3.5 h-3.5" />
                            API
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-3 sm:px-4 md:px-6 py-5">
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

                      {section.content.includes('grid_column') ? (
                        <div className="space-y-4">
                          {(() => {
                            const regex = new RegExp('content:\\|([\\s\\S]*?)(?=\\n\\s*(?:grid_column:|\\-\\s*width_ratio|width_ratio:|[A-Za-z_]+\\s*:)|$)','gm');
                            const matches = Array.from(section.content.matchAll(regex));
                            const blocks = matches.map((m) => (m[1] || '').trim());
                            const imgBlock = blocks[0] || '';
                            const textBlockRaw = blocks[1] || '';
                            const imgNameMatch = imgBlock.match(/\[(.+?\.(png|jpg|jpeg|gif))\]/i);
                            const imgLabel = imgNameMatch ? imgNameMatch[1] : imgBlock;
                            let normalizedText = normalizeMarkdown(textBlockRaw);
                            const beforeGrid = (section.content.split(/\n\s*grid_column:/)[0] || '').trim();
                            let beforeNormalized = normalizeMarkdown(beforeGrid);
                            const lastMatch = matches.length ? matches[matches.length - 1] : null;
                            const lastEnd = lastMatch ? (lastMatch.index as number) + lastMatch[0].length : 0;
                            const afterGrid = section.content.slice(lastEnd).trim();
                            const afterGridNormalized = normalizeMarkdown(afterGrid);
                            return (
                              <>
                                {beforeGrid && (
                                  <div data-slot="markdown" className="prose prose-sm prose-invert max-w-none">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        p: ({ children }) => (
                                          <p className="mb-2 text-foreground/80">{children}</p>
                                        ),
                                        ul: ({ children }) => (
                                          <ul className="list-disc ml-6 space-y-1">{children}</ul>
                                        ),
                                        ol: ({ children }) => (
                                          <ol className="list-decimal ml-6 space-y-1">{children}</ol>
                                        ),
                                        li: ({ children }) => (
                                          <li className="text-foreground/80">{children}</li>
                                        ),
                                        a: ({ children, href }) => (
                                          <a href={href} className="text-primary underline underline-offset-2">{children}</a>
                                        ),
                                      }}
                                    >
                                      {beforeNormalized}
                                    </ReactMarkdown>
                                  </div>
                                )}
                                <div className="relative rounded-lg border border-border bg-card/50 h-48 flex items-center justify-center">
                                  <span className="text-sm text-muted-foreground">{imgLabel || '图片占位'}</span>
                                </div>
                                <div data-slot="markdown" className="prose prose-sm prose-invert max-w-none">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      p: ({ children }) => (
                                        <p className="mb-2 text-foreground/80">{children}</p>
                                      ),
                                      ul: ({ children }) => (
                                        <ul className="list-disc ml-6 space-y-1">{children}</ul>
                                      ),
                                      ol: ({ children }) => (
                                        <ol className="list-decimal ml-6 space-y-1">{children}</ol>
                                      ),
                                      li: ({ children }) => (
                                        <li className="text-foreground/80">{children}</li>
                                      ),
                                      a: ({ children, href }) => (
                                        <a href={href} className="text-primary underline underline-offset-2">{children}</a>
                                      ),
                                    }}
                                  >
                                    {normalizedText}
                                  </ReactMarkdown>
                                </div>
                                {afterGridNormalized && (
                                  <div data-slot="markdown" className="prose prose-sm prose-invert max-w-none">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        p: ({ children }) => (
                                          <p className="mb-2 text-foreground/80">{children}</p>
                                        ),
                                        ul: ({ children }) => (
                                          <ul className="list-disc ml-6 space-y-1">{children}</ul>
                                        ),
                                        ol: ({ children }) => (
                                          <ol className="list-decimal ml-6 space-y-1">{children}</ol>
                                        ),
                                        li: ({ children }) => (
                                          <li className="text-foreground/80">{children}</li>
                                        ),
                                        a: ({ children, href }) => (
                                          <a href={href} className="text-primary underline underline-offset-2">{children}</a>
                                        ),
                                      }}
                                    >
                                      {afterGridNormalized}
                                    </ReactMarkdown>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div data-slot="markdown" className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => (
                                <p className="mb-2 text-foreground/80">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc ml-6 space-y-1">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal ml-6 space-y-1">{children}</ol>
                              ),
                              li: ({ children }) => (
                                <li className="text-foreground/80">{children}</li>
                              ),
                              a: ({ children, href }) => (
                                <a href={href} className="text-primary underline underline-offset-2">{children}</a>
                              ),
                            }}
                          >
                            {normalizeMarkdown(section.content)}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {highlightedSection === section.id && (
                      <div className="h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}