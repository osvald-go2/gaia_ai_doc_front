import { useState, useMemo } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels@2.1.7';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area@1.2.3';
import { DocumentPanel } from '../components/DocumentPanel';
import { InterfaceList, APIInterface } from '../components/InterfaceList';
import { InterfaceEditor } from '../components/InterfaceEditor';
import { DocumentSection } from '../utils/dataTransform';
import { FileText, Code2, Settings2 } from 'lucide-react@0.487.0';

interface GeneratorLayoutProps {
  interfaces: APIInterface[];
  documentSections: DocumentSection[];
  selectedInterfaceId?: string;
  selectedInterfaceIds: string[];
  onSelectInterface: (id: string) => void;
  onToggleSelectInterface: (id: string) => void;
  onSelectAllInterfaces: (selected: boolean) => void;
  onAddInterface: () => void;
  highlightedSection?: string;
  onSectionClick: (sectionId: string) => void;
  onViewSource: (sectionId: string) => void;
  onInterfaceUpdate: (updated: APIInterface) => void;
  onCloseEditor: () => void;
}

export default function GeneratorLayout(props: GeneratorLayoutProps) {
  const {
    interfaces,
    documentSections,
    selectedInterfaceId,
    selectedInterfaceIds,
    onSelectInterface,
    onToggleSelectInterface,
    onSelectAllInterfaces,
    onAddInterface,
    highlightedSection,
    onSectionClick,
    onViewSource,
    onInterfaceUpdate,
    onCloseEditor,
  } = props;

  const selectedInterface = interfaces.find((i) => i.id === selectedInterfaceId);

  const persisted = localStorage.getItem('gen_layout_sizes');
  const defaultLayout: [number, number, number] = persisted ? JSON.parse(persisted) : [30, 30, 40];

  const [collapsedLeft, setCollapsedLeft] = useState(false);
  const [collapsedMid, setCollapsedMid] = useState(false);
  const [collapsedRight, setCollapsedRight] = useState(false);

  const computedSizes = useMemo(() => {
    // Base sizes
    let [l, m, r] = defaultLayout;
    const minCollapsed = 4;
    let total = 100;
    // Apply collapses
    if (collapsedLeft) { l = minCollapsed; }
    if (collapsedMid) { m = minCollapsed; }
    if (collapsedRight) { r = minCollapsed; }
    // Normalize to 100
    const sum = l + m + r;
    l = Math.round((l / sum) * total);
    m = Math.round((m / sum) * total);
    r = total - l - m;
    return [l, m, r] as [number, number, number];
  }, [defaultLayout, collapsedLeft, collapsedMid, collapsedRight]);

  return (
    <PanelGroup
      direction="horizontal"
      key={`${collapsedLeft}-${collapsedMid}-${collapsedRight}`}
      onLayout={(sizes) => localStorage.setItem('gen_layout_sizes', JSON.stringify(sizes))}
      className="flex-1 min-h-0"
    >
      {/* Left: Document */}
      <Panel defaultSize={computedSizes[0]} minSize={8} className="h-full">
        <div className="flex flex-col h-full min-h-0 bg-card border-r border-border">
          {collapsedLeft ? (
            <div className="h-full flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5" onClick={() => setCollapsedLeft(false)}>
              <FileText className="w-5 h-5 text-primary" />
              <div className="text-xs text-muted-foreground" style={{ writingMode: 'vertical-rl' }}>文档</div>
            </div>
          ) : (
            <ScrollAreaPrimitive.Root className="relative flex-1 overflow-hidden">
              <ScrollAreaPrimitive.Viewport className="h-full w-full">
                <DocumentPanel
                  sections={documentSections}
                  highlightedSection={highlightedSection}
                  isCollapsed={false}
                  onToggleCollapse={() => setCollapsedLeft(true)}
                  onSectionClick={onSectionClick}
                />
              </ScrollAreaPrimitive.Viewport>
            </ScrollAreaPrimitive.Root>
          )}
        </div>
      </Panel>
      <PanelResizeHandle className="w-1 bg-border hover:bg-primary/30 transition-colors" />

      {/* Middle: Interface List */}
      <Panel defaultSize={computedSizes[1]} minSize={12} className="h-full">
        <div className="flex flex-col h-full min-h-0 bg-card border-r border-border">
          {collapsedMid ? (
            <div className="h-full flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5" onClick={() => setCollapsedMid(false)}>
              <Code2 className="w-5 h-5 text-primary" />
              <div className="text-xs text-muted-foreground" style={{ writingMode: 'vertical-rl' }}>接口</div>
            </div>
          ) : (
            <ScrollAreaPrimitive.Root className="relative flex-1 overflow-hidden">
              <ScrollAreaPrimitive.Viewport className="h-full w-full">
                <InterfaceList
                  interfaces={interfaces}
                  selectedId={selectedInterfaceId}
                  selectedIds={selectedInterfaceIds}
                  onSelect={onSelectInterface}
                  onToggleSelect={onToggleSelectInterface}
                  onSelectAll={onSelectAllInterfaces}
                  onAdd={onAddInterface}
                  isCollapsed={false}
                  onToggleCollapse={() => setCollapsedMid(true)}
                  onViewSource={onViewSource}
                />
              </ScrollAreaPrimitive.Viewport>
            </ScrollAreaPrimitive.Root>
          )}
        </div>
      </Panel>
      <PanelResizeHandle className="w-1 bg-border hover:bg-primary/30 transition-colors" />

      {/* Right: Interface Editor (字段配置 + 工作流预览) */}
      <Panel defaultSize={computedSizes[2]} minSize={30} className="h-full">
        <div className="flex flex-col h-full min-h-0 bg-card">
          {collapsedRight ? (
            <div className="h-full flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5" onClick={() => setCollapsedRight(false)}>
              <Settings2 className="w-5 h-5 text-primary" />
              <div className="text-xs text-muted-foreground" style={{ writingMode: 'vertical-rl' }}>配置</div>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <InterfaceEditor
                interface={selectedInterface || interfaces[0]}
                onUpdate={onInterfaceUpdate}
                onViewSource={onViewSource}
                onClose={onCloseEditor}
              />
            </div>
          )}
        </div>
      </Panel>
    </PanelGroup>
  );
}
