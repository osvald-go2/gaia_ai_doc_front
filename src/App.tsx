import { useState, useEffect } from 'react';
import { URLInput } from './components/URLInput';
import { LoadingProcess } from './components/LoadingProcess';
import { Header } from './components/Header';
import { DocumentPanel } from './components/DocumentPanel';
import { InterfaceList, APIInterface } from './components/InterfaceList';
import { InterfaceEditor } from './components/InterfaceEditor';
import { DocumentPreview } from './components/DocumentPreview';
import { APIGenerator } from './components/APIGenerator';
import { HistoryPanel, HistoryItem } from './components/HistoryPanel';
import { SettingsPanel, AppSettings } from './components/SettingsPanel';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';
import apiService, { WorkflowResponse } from './services/api';
import { transformISMToInterfaces, transformISMToDocumentSections, DocumentSection, validateBackendData } from './utils/dataTransform';
import { BackendWorkflowResponse } from './types/backend';

// 默认飞书文档链接
const DEFAULT_FEISHU_URL = 'https://ecnjtt87q4e5.feishu.cn/wiki/O2NjwrNDCiRDqMkWJyfcNwd5nXe';

function AppContent() {
  const [step, setStep] = useState<'input' | 'loading' | 'parsed'>('input');
  const [interfaces, setInterfaces] = useState<APIInterface[]>([]);
  const [documentSections, setDocumentSections] = useState<DocumentSection[]>([]);
  const [currentURL, setCurrentURL] = useState<string>('');
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [selectedInterfaceId, setSelectedInterfaceId] = useState<string>();
  const [selectedInterfaceIds, setSelectedInterfaceIds] = useState<string[]>([]);
  const [highlightedSection, setHighlightedSection] = useState<string>();
  const [isDocPreviewOpen, setIsDocPreviewOpen] = useState(false);
  const [isAPIGeneratorOpen, setIsAPIGeneratorOpen] = useState(false);

  // Panel collapse states
  const [isDocPanelCollapsed, setIsDocPanelCollapsed] = useState(false);
  const [isListPanelCollapsed, setIsListPanelCollapsed] = useState(false);

  // History and Settings
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    autoSave: true,
    maxHistoryItems: 50,
    defaultMethod: 'GET',
    enableNotifications: true,
    apiTimeout: 30,
  });

  // Load history and settings from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('apiGenHistory');
    const savedSettings = localStorage.getItem('apiGenSettings');

    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('apiGenHistory', JSON.stringify(history));
    }
  }, [history]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('apiGenSettings', JSON.stringify(settings));
  }, [settings]);

  const handleURLSubmit = async (url: string) => {
    setCurrentURL(url);
    setLoadingError(null);
    setStep('loading');

    try {
      // 调用后端API解析文档
      const response: WorkflowResponse = await apiService.parseDocument(url);

      // 检查API调用是否成功
      if (apiService.isSuccessfulResponse(response)) {
        // 提取后端数据
        const backendData = apiService.extractBackendData(response);

        if (!backendData) {
          throw new Error('无法从后端响应中提取有效数据');
        }

        // 验证数据结构
        if (!validateBackendData(backendData)) {
          throw new Error('后端返回的数据结构不正确');
        }

        // 转换ISM数据为前端接口格式
        const newInterfaces = transformISMToInterfaces(backendData.ism);
        const newDocumentSections = transformISMToDocumentSections(
          backendData.ism,
          backendData.raw_docs
        );

        // 更新状态
        setInterfaces(newInterfaces);
        setDocumentSections(newDocumentSections);

        if (newInterfaces.length > 0) {
          setSelectedInterfaceId(newInterfaces[0].id);
        }

        // 添加到历史记录
        const newHistoryItem: HistoryItem = {
          id: `history-${Date.now()}`,
          url: url,
          title: backendData.ism.doc_meta?.title || 'AI生成接口',
          timestamp: new Date(),
          interfaceCount: newInterfaces.length,
        };

        setHistory((prev) => {
          const updated = [newHistoryItem, ...prev];
          return updated.slice(0, settings.maxHistoryItems);
        });

        if (settings.enableNotifications) {
          toast.success('文档解析完成', {
            description: `成功提取 ${newInterfaces.length} 个接口`,
          });
        }

        // 延迟一下显示完成状态，让用户看到加载过程
        setTimeout(() => {
          setStep('parsed');
          setLoadingError(null);
        }, 500);

      } else {
        const errorMessage = apiService.getErrorMessage(response);
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('Failed to parse document:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';

      setLoadingError(errorMessage);

      // 显示错误信息
      toast.error('文档解析失败', {
        description: errorMessage,
      });

      // 设置错误状态，不再使用Mock数据
      setTimeout(() => {
        setStep('input'); // 返回输入页面
        setLoadingError(null);
        setInterfaces([]);
        setDocumentSections([]);
      }, 3000);
    }
  };

  const handleLoadingComplete = () => {
    // 这个函数现在由handleURLSubmit中的异步逻辑处理
    // 保留是为了兼容LoadingProcess组件的onComplete回调
  };

  const handleInterfaceUpdate = (updated: APIInterface) => {
    setInterfaces(interfaces.map((i) => (i.id === updated.id ? updated : i)));
    toast.success('接口配置已更新');
  };

  const handleViewSource = (sectionId: string) => {
    setHighlightedSection(sectionId);
    const element = document.getElementById(`doc-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Clear highlight after 3 seconds
    setTimeout(() => setHighlightedSection(undefined), 3000);
  };

  const handleSectionClick = (sectionId: string) => {
    // 根据文档段落找到对应的接口
    const correspondingInterface = interfaces.find((i) => i.sourceSection === sectionId);
    if (correspondingInterface) {
      setSelectedInterfaceId(correspondingInterface.id);
      toast.success('已跳转到对应接口');
    }
  };

  const handleAddInterface = () => {
    const newInterface: APIInterface = {
      id: `api-${Date.now()}`,
      name: '新接口',
      method: settings.defaultMethod,
      endpoint: '/api/v1/new',
      sourceSection: '',
      requestFields: [],
      responseFields: [],
    };
    setInterfaces([...interfaces, newInterface]);
    setSelectedInterfaceId(newInterface.id);
    if (settings.enableNotifications) {
      toast.success('已创建新接口');
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    // 重新解析历史记录中的URL
    handleURLSubmit(item.url);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    toast.success('已删除历史记录');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('apiGenHistory');
    toast.success('已清空历史记录');
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (newSettings.enableNotifications) {
      toast.success('设置已保存');
    }
  };

  const handleBackToHome = () => {
    setStep('input');
    setInterfaces([]);
    setDocumentSections([]);
    setCurrentURL('');
    setLoadingError(null);
    setSelectedInterfaceId(undefined);
    setHighlightedSection(undefined);
    toast.info('已返回首页');
  };

  const handleGenerateDoc = () => {
    if (interfaces.length === 0) {
      toast.error('暂无接口数据');
      return;
    }
    setIsDocPreviewOpen(true);
    toast.success('文档生成成功');
  };

  const handleGenerateAPI = () => {
    if (selectedInterfaceIds.length === 0) {
      toast.error('请先选择要生成的接口');
      return;
    }
    setIsAPIGeneratorOpen(true);
  };

  const handleToggleSelectInterface = (id: string) => {
    setSelectedInterfaceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllInterfaces = (selected: boolean) => {
    if (selected) {
      setSelectedInterfaceIds(interfaces.map((i) => i.id));
      toast.success(`已选中全部 ${interfaces.length} 个接口`);
    } else {
      setSelectedInterfaceIds([]);
      toast.info('已取消选择');
    }
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + A: 全选
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && step === 'parsed') {
        e.preventDefault();
        handleSelectAllInterfaces(selectedInterfaceIds.length !== interfaces.length);
      }
      // Ctrl/Cmd + D: 取消选择
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && step === 'parsed') {
        e.preventDefault();
        setSelectedInterfaceIds([]);
      }
      // Ctrl/Cmd + G: 生成接口
      if ((e.ctrlKey || e.metaKey) && e.key === 'g' && step === 'parsed' && selectedInterfaceIds.length > 0) {
        e.preventDefault();
        handleGenerateAPI();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, interfaces, selectedInterfaceIds]);

  const selectedInterface = interfaces.find((i) => i.id === selectedInterfaceId);

  if (step === 'input') {
    return (
      <>
        <URLInput
          onSubmit={handleURLSubmit}
          loading={false}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        <HistoryPanel
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={history}
          onSelectHistory={handleSelectHistory}
          onDeleteHistory={handleDeleteHistory}
          onClearHistory={handleClearHistory}
        />
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
        <Toaster position="bottom-right" />
      </>
    );
  }

  if (step === 'loading') {
    return (
      <>
        <LoadingProcess onComplete={handleLoadingComplete} />
        <Toaster position="bottom-right" />
      </>
    );
  }

  // 如果没有数据，显示空状态
  if (interfaces.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">暂无接口数据</h3>
            <p className="text-muted-foreground mb-4">请输入飞书文档URL来生成接口配置</p>
            <button
              onClick={handleBackToHome}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              重新输入文档
            </button>
          </div>
        </div>
        <Toaster position="bottom-right" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <Header
        onBack={handleBackToHome}
        interfaceCount={interfaces.length}
        selectedCount={selectedInterfaceIds.length}
        onGenerateDoc={handleGenerateDoc}
        onGenerateAPI={handleGenerateAPI}
      />

      {/* Document Preview Modal */}
      <DocumentPreview
        isOpen={isDocPreviewOpen}
        onClose={() => setIsDocPreviewOpen(false)}
        interfaces={interfaces}
        sections={documentSections}
      />

      {/* API Generator Modal */}
      <APIGenerator
        isOpen={isAPIGeneratorOpen}
        onClose={() => {
          setIsAPIGeneratorOpen(false);
          // 清空选择
          setSelectedInterfaceIds([]);
          toast.success('接口已同步到远端平台');
        }}
        interfaces={interfaces.filter((i) => selectedInterfaceIds.includes(i.id))}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden bg-gradient-to-br from-background to-background/95">
        {/* Document Panel */}
        <motion.div
          initial={false}
          animate={{ width: isDocPanelCollapsed ? '56px' : '320px' }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="h-full flex-shrink-0"
        >
          <DocumentPanel
            sections={documentSections}
            highlightedSection={highlightedSection}
            isCollapsed={isDocPanelCollapsed}
            onToggleCollapse={() => setIsDocPanelCollapsed(!isDocPanelCollapsed)}
            onSectionClick={handleSectionClick}
          />
        </motion.div>

        {/* Interface List */}
        <motion.div
          initial={false}
          animate={{ width: isListPanelCollapsed ? '56px' : '320px' }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="h-full flex-shrink-0"
        >
          <InterfaceList
            interfaces={interfaces}
            selectedId={selectedInterfaceId}
            selectedIds={selectedInterfaceIds}
            onSelect={setSelectedInterfaceId}
            onToggleSelect={handleToggleSelectInterface}
            onSelectAll={handleSelectAllInterfaces}
            onAdd={handleAddInterface}
            isCollapsed={isListPanelCollapsed}
            onToggleCollapse={() => setIsListPanelCollapsed(!isListPanelCollapsed)}
            onViewSource={handleViewSource}
          />
        </motion.div>

        {/* Interface Editor */}
        <div className="flex-1 h-full min-w-0">
          {selectedInterface ? (
            <InterfaceEditor
              interface={selectedInterface}
              onUpdate={handleInterfaceUpdate}
              onViewSource={handleViewSource}
              onClose={() => setSelectedInterfaceId(undefined)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-card">
              <div className="flex flex-col items-center gap-8">
                {/* Icon Container */}
                <div className="relative">
                  {/* Outer Glow Ring */}
                  <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl animate-pulse" style={{ width: '200px', height: '200px' }} />

                  {/* Main Icon Circle */}
                  <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center backdrop-blur-sm">
                    {/* Inner Circle */}
                    <div className="w-36 h-36 rounded-full bg-card/50 border border-primary/20 flex items-center justify-center">
                      {/* Icon */}
                      <svg
                        className="w-20 h-20 text-primary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {/* Table/Fields Icon */}
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                        <line x1="3" y1="15" x2="21" y2="15" />
                      </svg>
                    </div>

                    {/* Decorative Dots */}
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: '0s' }} />
                    <div className="absolute bottom-6 left-6 w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute top-8 left-4 w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                </div>

                {/* Text */}
                <div className="text-center space-y-2">
                  <h3 className="text-foreground/90 tracking-wide">请选择接口进行字段配置</h3>
                  <p className="text-sm text-muted-foreground">从左侧接口列表中选择一个接口开始编辑</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}