import { useState, useEffect } from 'react';
import { APIInterface, APIField, APIResponseField } from './InterfaceList';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollBar } from './ui/scroll-area';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area@1.2.3';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, Plus, FileText, ArrowDownToLine, ArrowUpFromLine, X, Eye, Settings2 } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { WorkflowPreview } from './WorkflowPreview';

interface InterfaceEditorProps {
  interface: APIInterface;
  onUpdate: (updated: APIInterface) => void;
  onViewSource: (sectionId: string) => void;
  onClose: () => void;
}

export function InterfaceEditor({ interface: apiInterface, onUpdate, onViewSource, onClose }: InterfaceEditorProps) {
  // 数据迁移：如果存在旧的 fields，将其迁移到 requestFields
  const migratedInterface = {
    ...apiInterface,
    requestFields: apiInterface.requestFields || apiInterface.fields || [],
    responseFields: apiInterface.responseFields || [],
  };
  
  const [editingInterface, setEditingInterface] = useState(migratedInterface);
  const [viewMode, setViewMode] = useState<'config' | 'workflow'>('config');

  // 当传入的 interface 变化时，更新内部状态
  useEffect(() => {
    const updated = {
      ...apiInterface,
      requestFields: apiInterface.requestFields || apiInterface.fields || [],
      responseFields: apiInterface.responseFields || [],
    };
    setEditingInterface(updated);
  }, [apiInterface.id]);

  const updateRequestField = (fieldId: string, updates: Partial<APIField>) => {
    const updated = {
      ...editingInterface,
      requestFields: editingInterface.requestFields.map((f) =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    };
    setEditingInterface(updated);
    onUpdate(updated);
  };

  const updateResponseField = (fieldId: string, updates: Partial<APIResponseField>) => {
    const updated = {
      ...editingInterface,
      responseFields: editingInterface.responseFields.map((f) =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    };
    setEditingInterface(updated);
    onUpdate(updated);
  };

  const addRequestField = () => {
    const newField: APIField = {
      id: `req-${Date.now()}`,
      name: '',
      expression: '',
      required: false,
      type: 'string',
    };
    const updated = {
      ...editingInterface,
      requestFields: [...editingInterface.requestFields, newField],
    };
    setEditingInterface(updated);
    onUpdate(updated);
  };

  const addResponseField = () => {
    const newField: APIResponseField = {
      id: `res-${Date.now()}`,
      name: '',
      expression: '',
      description: '',
      required: false,
      type: 'string',
    };
    const updated = {
      ...editingInterface,
      responseFields: [...editingInterface.responseFields, newField],
    };
    setEditingInterface(updated);
    onUpdate(updated);
  };

  const removeRequestField = (fieldId: string) => {
    const updated = {
      ...editingInterface,
      requestFields: editingInterface.requestFields.filter((f) => f.id !== fieldId),
    };
    setEditingInterface(updated);
    onUpdate(updated);
  };

  const removeResponseField = (fieldId: string) => {
    const updated = {
      ...editingInterface,
      responseFields: editingInterface.responseFields.filter((f) => f.id !== fieldId),
    };
    setEditingInterface(updated);
    onUpdate(updated);
  };

  return (
    <div className="h-full flex flex-col bg-card shadow-inner">
      <div className="border-b border-border">
        {/* 接口配置 Header */}
        <div className="px-6 py-3 border-b border-border bg-gradient-to-r from-secondary/30 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary drop-shadow-sm" />
            <h3 className="text-primary">接口配置</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                入参 {editingInterface.requestFields.length}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                出参 {editingInterface.responseFields.length}
              </span>
            </div>
            
            {/* 视图切换按钮 */}
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5 border border-border">
              <Button
                onClick={() => setViewMode('config')}
                variant="ghost"
                size="sm"
                className={`h-6 text-xs px-2.5 ${
                  viewMode === 'config'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5 mr-1" />
                字段配置
              </Button>
              <Button
                onClick={() => setViewMode('workflow')}
                variant="ghost"
                size="sm"
                className={`h-6 text-xs px-2.5 ${
                  viewMode === 'workflow'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                工作流预览
              </Button>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 接口信息内容 - 仅在配置模式显示 */}
        {viewMode === 'config' && (
          <div className="px-6 py-3 space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">接口名称</label>
              <Input
                value={editingInterface.name}
                onChange={(e) => setEditingInterface({ ...editingInterface, name: e.target.value })}
                className="bg-secondary border-border text-foreground h-9 focus:border-primary/50 focus:shadow-sm focus:shadow-primary/10 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">请求方法</label>
              <Select
                value={editingInterface.method}
                onValueChange={(value: any) =>
                  setEditingInterface({ ...editingInterface, method: value })
                }
              >
                <SelectTrigger className="bg-secondary border-border text-foreground h-9 focus:border-primary/50 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border shadow-lg">
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">端点路径</label>
              <Input
                value={editingInterface.endpoint}
                onChange={(e) =>
                  setEditingInterface({ ...editingInterface, endpoint: e.target.value })
                }
                className="bg-secondary border-border text-foreground h-9 focus:border-primary/50 focus:shadow-sm focus:shadow-primary/10 transition-all"
                placeholder="/api/v1/..."
              />
            </div>
          </div>
          </div>
        )}
      </div>

      {/* 根据视图模式显示不同内容 */}
      {viewMode === 'config' ? (
        <ScrollAreaPrimitive.Root className="relative flex-1 overflow-hidden">
          <ScrollAreaPrimitive.Viewport className="h-full w-full">
            <div className="flex flex-col">
            {/* 入参区域 */}
            <div className="border-b border-border">
              <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-secondary/30 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpFromLine className="w-5 h-5 text-primary drop-shadow-sm" />
                    <h3 className="text-primary">入参配置</h3>
                    <span className="text-xs text-muted-foreground">({editingInterface.requestFields.length})</span>
                  </div>
                  <Button
                    onClick={addRequestField}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 shadow-md shadow-primary/20 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    添加入参字段
                  </Button>
                </div>
              </div>

              <div className="px-6 pt-4 pb-2">
                {/* 表头 */}
                <div className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground bg-gradient-to-br from-card/50 to-secondary/20 border-b border-border shadow-sm">
                  <div className="flex-1">字段名</div>
                  <div className="w-28">类型</div>
                  <div className="flex-1">中文名</div>
                  <div className="w-16 text-center">必填</div>
                  <div className="w-8 text-center">操作</div>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-1.5">
                {editingInterface.requestFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 p-2 bg-secondary/50 border border-border rounded hover:bg-secondary/70 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                  >
                    <Input
                      value={field.name}
                      onChange={(e) => updateRequestField(field.id, { name: e.target.value })}
                      placeholder="字段名称"
                      className="bg-card border-border text-foreground h-8 text-sm flex-1 focus:border-primary/50 focus:shadow-sm transition-all"
                    />
                    
                    <Select
                      value={field.type}
                      onValueChange={(value: any) => updateRequestField(field.id, { type: value })}
                    >
                      <SelectTrigger className="bg-card border-border text-foreground h-8 text-sm w-28 focus:border-primary/50 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border shadow-lg">
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                        <SelectItem value="array">Array</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      value={field.expression}
                      onChange={(e) => updateRequestField(field.id, { expression: e.target.value })}
                      placeholder="描述"
                      className="bg-card border-border text-foreground h-8 text-sm flex-1 focus:border-primary/50 focus:shadow-sm transition-all"
                    />

                    <div className="flex items-center justify-center w-16">
                      <Switch
                        id={`req-required-${field.id}`}
                        checked={field.required}
                        onCheckedChange={(checked) => updateRequestField(field.id, { required: checked })}
                        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted data-[state=unchecked]:border data-[state=unchecked]:border-border scale-75"
                      />
                    </div>
                    
                    <Button
                      onClick={() => removeRequestField(field.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {editingInterface.requestFields.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="mb-4">暂无入参字段</p>
                    <Button
                      onClick={addRequestField}
                      variant="outline"
                      className="border-primary/30 hover:bg-primary/10 hover:text-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加第一个入参
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* 出参区域 */}
            <div>
              <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-secondary/30 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowDownToLine className="w-5 h-5 text-primary drop-shadow-sm" />
                    <h3 className="text-primary">出参配置</h3>
                    <span className="text-xs text-muted-foreground">({editingInterface.responseFields.length})</span>
                  </div>
                  <Button
                    onClick={addResponseField}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 shadow-md shadow-primary/20 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    添加出参字段
                  </Button>
                </div>
              </div>

              <div className="px-6 pt-4 pb-2">
                {/* 表头 */}
                <div className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground bg-gradient-to-br from-card/50 to-secondary/20 border-b border-border shadow-sm">
                  <div className="w-32">字段名</div>
                  <div className="w-28">类型</div>
                  <div className="flex-1">表达式</div>
                  <div className="flex-1">中文名</div>
                  <div className="w-8 text-center">操作</div>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-1.5">
                {editingInterface.responseFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 p-2 bg-secondary/50 border border-border rounded hover:bg-secondary/70 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                  >
                    <Input
                      value={field.name}
                      onChange={(e) => updateResponseField(field.id, { name: e.target.value })}
                      placeholder="字段名称"
                      className="bg-card border-border text-foreground h-8 text-sm w-32 focus:border-primary/50 focus:shadow-sm transition-all"
                    />
                    
                    <Select
                      value={field.type}
                      onValueChange={(value: any) => updateResponseField(field.id, { type: value })}
                    >
                      <SelectTrigger className="bg-card border-border text-foreground h-8 text-sm w-28 focus:border-primary/50 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border shadow-lg">
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                        <SelectItem value="array">Array</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      value={field.expression}
                      onChange={(e) => updateResponseField(field.id, { expression: e.target.value })}
                      placeholder="表达式"
                      className="bg-card border-border text-foreground h-8 text-sm flex-1 focus:border-primary/50 focus:shadow-sm transition-all"
                    />

                    <Input
                      value={field.description || ''}
                      onChange={(e) => updateResponseField(field.id, { description: e.target.value })}
                      placeholder="额外描述"
                      className="bg-card border-border text-foreground h-8 text-sm flex-1 focus:border-primary/50 focus:shadow-sm transition-all"
                    />
                    
                    <Button
                      onClick={() => removeResponseField(field.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {editingInterface.responseFields.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="mb-4">暂无出参字段</p>
                    <Button
                      onClick={addResponseField}
                      variant="outline"
                      className="border-primary/30 hover:bg-primary/10 hover:text-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加第一个出参
                    </Button>
                  </div>
                )}
              </div>
            </div>
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
      ) : (
        <div className="flex-1 overflow-hidden">
          <WorkflowPreview interface={editingInterface} />
        </div>
      )}
    </div>
  );
}
