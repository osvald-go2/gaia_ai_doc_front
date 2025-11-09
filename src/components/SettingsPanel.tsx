import { Settings, X, Moon, Sparkles, Zap, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { useTheme } from './ThemeProvider';

export interface AppSettings {
  theme: 'dark' | 'claude';
  autoSave: boolean;
  maxHistoryItems: number;
  defaultMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  enableNotifications: boolean;
  apiTimeout: number;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    if (key === 'theme') {
      setTheme(value as 'dark' | 'claude');
    }
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] p-0 bg-card border-l border-border">
        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b border-border bg-gradient-to-l from-secondary/30 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/30 flex items-center justify-center shadow-sm">
                <Settings className="w-4 h-4 text-primary" />
              </div>
              <SheetTitle className="text-foreground">系统设置</SheetTitle>
            </div>
            <SheetDescription className="sr-only">
              配置应用程序的外观、功能和接口设置
            </SheetDescription>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* 外观设置 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  <h3 className="text-sm text-primary">外观设置</h3>
                </div>
                <div className="space-y-3 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-sm text-foreground">
                      主题模式
                    </Label>
                    <Select
                      value={theme}
                      onValueChange={(value: any) => updateSetting('theme', value)}
                    >
                      <SelectTrigger
                        id="theme"
                        className="bg-secondary border-border text-foreground h-9 focus:border-primary/50 transition-all"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border shadow-lg">
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#00ff88]" />
                            <div>
                              <div>荧光绿 (深色)</div>
                              <div className="text-xs text-muted-foreground">黑色背景 + 荧光绿强调色</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="claude">
                          <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4 text-[#ea580c]" />
                            <div>
                              <div>Claude Code</div>
                              <div className="text-xs text-muted-foreground">温暖琥珀色主题</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Theme Preview Card */}
                  <div className="mt-4 p-4 rounded-lg border border-border bg-gradient-to-br from-secondary/50 to-secondary/20">
                    <div className="text-xs text-muted-foreground mb-3">当前主题预览</div>
                    <div className="space-y-3">
                      {/* Color Swatches */}
                      <div className="flex items-center gap-2">
                        {theme === 'dark' ? (
                          <>
                            <div className="flex-1 h-12 rounded-md bg-[#0f0f11] border border-[#3f3f46] flex items-center justify-center gap-2 px-3">
                              <div className="w-6 h-6 rounded-full bg-[#00ff88] shadow-lg shadow-[#00ff88]/30" />
                              <div className="w-6 h-6 rounded-full bg-[#18181b] border border-[#3f3f46]" />
                              <div className="w-6 h-6 rounded-full bg-[#27272a]" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex-1 h-12 rounded-md bg-[#fafaf9] border border-[#e7e5e4] flex items-center justify-center gap-2 px-3">
                              <div className="w-6 h-6 rounded-full bg-[#ea580c] shadow-lg shadow-[#ea580c]/20" />
                              <div className="w-6 h-6 rounded-full bg-[#ffffff] border border-[#e7e5e4]" />
                              <div className="w-6 h-6 rounded-full bg-[#f5f5f4]" />
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Theme Name and Description */}
                      <div className="text-center">
                        {theme === 'dark' ? (
                          <div className="space-y-1">
                            <div className="text-sm text-foreground">荧光绿深色主题</div>
                            <div className="text-xs text-muted-foreground">黑色背景 · 荧光强调 · 科技感</div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-sm text-foreground">Claude Code 主题</div>
                            <div className="text-xs text-muted-foreground">浅色背景 · 温暖琥珀 · 优雅简洁</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              {/* 功能设置 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <h3 className="text-sm text-primary">功能设置</h3>
                </div>
                <div className="space-y-4 pl-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-save" className="text-sm text-foreground">
                        自动保存
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        修改后自动保存接口配置
                      </p>
                    </div>
                    <Switch
                      id="auto-save"
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications" className="text-sm text-foreground">
                        桌面通知
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        启用操作完成通知提醒
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={settings.enableNotifications}
                      onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              {/* 接口设置 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <h3 className="text-sm text-primary">接口设置</h3>
                </div>
                <div className="space-y-3 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="default-method" className="text-sm text-foreground">
                      默认请求方法
                    </Label>
                    <Select
                      value={settings.defaultMethod}
                      onValueChange={(value: any) => updateSetting('defaultMethod', value)}
                    >
                      <SelectTrigger
                        id="default-method"
                        className="bg-secondary border-border text-foreground h-9 focus:border-primary/50 transition-all"
                      >
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

                  <div className="space-y-2">
                    <Label htmlFor="timeout" className="text-sm text-foreground">
                      API 超时时间 (秒)
                    </Label>
                    <Input
                      id="timeout"
                      type="number"
                      min="5"
                      max="120"
                      value={settings.apiTimeout}
                      onChange={(e) => updateSetting('apiTimeout', parseInt(e.target.value) || 30)}
                      className="bg-secondary border-border text-foreground h-9 focus:border-primary/50 focus:shadow-sm focus:shadow-primary/10 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-history" className="text-sm text-foreground">
                      最大历史记录数
                    </Label>
                    <Input
                      id="max-history"
                      type="number"
                      min="10"
                      max="100"
                      value={settings.maxHistoryItems}
                      onChange={(e) => updateSetting('maxHistoryItems', parseInt(e.target.value) || 50)}
                      className="bg-secondary border-border text-foreground h-9 focus:border-primary/50 focus:shadow-sm focus:shadow-primary/10 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
