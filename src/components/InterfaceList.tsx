import { Code2, ChevronRight, Plus, ChevronLeft, Check } from 'lucide-react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area@1.2.3';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui/utils';

export interface APIField {
  id: string;
  name: string;
  expression: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
}

export interface APIResponseField extends APIField {
  description?: string; // 出参额外的描述字段
}

export interface APIInterface {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  sourceSection: string;
  requestFields: APIField[]; // 入参
  responseFields: APIResponseField[]; // 出参
  // 为了兼容旧数据，保留 fields 字段
  fields?: Array<{
    id: string;
    name: string;
    expression: string;
    required: boolean;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  }>;
}

interface InterfaceListProps {
  interfaces: APIInterface[];
  selectedId?: string;
  selectedIds?: string[];
  onSelect: (id: string) => void;
  onToggleSelect?: (id: string) => void;
  onSelectAll?: (selected: boolean) => void;
  onAdd: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onViewSource?: (sectionId: string) => void;
}

export function InterfaceList({ 
  interfaces, 
  selectedId, 
  selectedIds = [],
  onSelect, 
  onToggleSelect,
  onSelectAll,
  onAdd, 
  isCollapsed, 
  onToggleCollapse,
  onViewSource
}: InterfaceListProps) {
  const methodColors = {
    GET: 'text-green-400 bg-green-400/10 border-green-400/30',
    POST: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    PUT: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    DELETE: 'text-red-400 bg-red-400/10 border-red-400/30',
  };
  
  const hasInterfaces = interfaces.length > 0;
  const allSelected = hasInterfaces && selectedIds.length === interfaces.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

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
            {/* 顶部展开按钮 */}
            <div className="h-10 w-10 rounded flex items-center justify-center hover:bg-primary/10 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10">
              <ChevronRight className="w-5 h-5 text-primary" />
            </div>
            
            {/* 中间接口数量显示 */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="text-2xl text-primary font-medium" style={{ writingMode: 'vertical-rl' }}>
                API
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/30 flex items-center justify-center shadow-sm">
                <span className="text-xs text-primary font-medium">{interfaces.length}</span>
              </div>
            </div>
            
            {/* 底部装饰图标 */}
            <Code2 className="w-5 h-5 text-primary/40" />
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
            <div className="p-4 border-b border-border bg-gradient-to-b from-card to-transparent">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Code2 className="w-5 h-5 text-primary drop-shadow-sm" />
                  <h2 className="text-foreground">接口列表</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={onAdd}
                    size="sm"
                    variant="outline"
                    className="h-8 border-primary/30 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={onToggleCollapse}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-primary/10 transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {onSelectAll && hasInterfaces && (
                      <div
                        onClick={() => onSelectAll(!allSelected)}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
                        role="button"
                        tabIndex={0}
                      >
                        <div className="relative">
                          <Checkbox 
                            checked={allSelected}
                            className={cn(
                              "cursor-pointer",
                              someSelected && !allSelected && "data-[state=unchecked]:bg-primary/15 data-[state=unchecked]:border-primary data-[state=unchecked]:shadow-sm data-[state=unchecked]:shadow-primary/20"
                            )}
                          />
                          {someSelected && !allSelected && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                              <div className="w-2 h-0.5 bg-primary rounded-full shadow-sm" />
                            </motion.div>
                          )}
                        </div>
                        <span className="group-hover:text-primary transition-colors">
                          {selectedIds.length > 0 ? `已选 ${selectedIds.length}` : `共 ${interfaces.length}`}
                        </span>
                      </div>
                    )}
                    {!onSelectAll && (
                      <p className="text-xs text-muted-foreground">共 {interfaces.length} 个接口</p>
                    )}
                  </div>
                  {hasInterfaces && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex gap-1"
                    >
                      {['GET', 'POST', 'PUT', 'DELETE'].map((method) => {
                        const count = interfaces.filter((i) => i.method === method).length;
                        if (count === 0) return null;
                        return (
                          <div
                            key={method}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${methodColors[method as keyof typeof methodColors]}`}
                          >
                            {count}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

      <ScrollArea type="always" className="relative flex-1">
        <div className="p-2 space-y-1">
          {interfaces.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center justify-center py-12 px-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mb-4">
                <Code2 className="w-8 h-8 text-primary/60" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">暂无接口</p>
              <p className="text-xs text-muted-foreground/70">
                点击"+"添加新接口
              </p>
            </motion.div>
          ) : (
            <>
              {/* 选中提示横幅 */}
              {selectedIds.length > 0 && onToggleSelect && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-2 mb-2 p-3 rounded-lg bg-primary/10 border border-primary/30 shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
                      <Check className="w-3.5 h-3.5" style={{ color: 'var(--primary-foreground, white)' }} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs text-primary">
                      已选中 {selectedIds.length} 个接口，点击顶部"生成接口"按钮同步到远端
                    </span>
                  </div>
                </motion.div>
              )}
              
              {interfaces.map((api, index) => {
                const isSelected = selectedIds.includes(api.id);
                
                return (
                  <motion.div
                    key={`${api.id}-${index}`}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="relative group"
                  >
                    {/* 复选框 */}
                    {onToggleSelect && (
                      <div 
                        className="absolute left-2.5 top-2.5 z-10 group-hover:scale-110 transition-transform duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelect(api.id);
                        }}
                      >
                        <Checkbox 
                          checked={isSelected}
                          className={cn(
                            "cursor-pointer",
                            !isSelected && "group-hover:border-primary/50"
                          )}
                        />
                      </div>
                    )}
                    
                    <button
                      onClick={() => {
                        onSelect(api.id);
                        if (api.sourceSection && onViewSource) {
                          onViewSource(api.sourceSection);
                        }
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                        onToggleSelect ? 'pl-10' : ''
                      } ${
                        selectedId === api.id
                          ? 'bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/50 shadow-md shadow-primary/10'
                          : isSelected
                          ? 'bg-primary/5 border border-primary/20 shadow-sm'
                          : 'bg-secondary/30 border border-transparent hover:bg-secondary/50 hover:border-primary/20 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm text-foreground truncate">{api.name}</span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 flex-shrink-0 ml-2 transition-all duration-200 ${
                            selectedId === api.id ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded border ${methodColors[api.method]}`}
                        >
                          {api.method}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">{api.endpoint}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        入参 {api.requestFields?.length || 0} · 出参 {api.responseFields?.length || 0}
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
