# 前端架构图和模块图文档

## 1. 技术栈概览

### 1.1 核心技术栈
- **前端框架**: React 18.3.1 + TypeScript
- **构建工具**: Vite 6.3.5 + SWC
- **样式方案**: Tailwind CSS + Radix UI
- **状态管理**: React Hooks (useState, useEffect)
- **动画库**: Motion (Framer Motion)
- **UI组件库**: Radix UI + 自定义组件
- **图标库**: Lucide React
- **通知系统**: Sonner

### 1.2 开发依赖
- **类型检查**: TypeScript
- **代码构建**: @vitejs/plugin-react-swc
- **路径别名**: 支持@符号指向src目录

## 2. 项目结构图

```mermaid
graph TD
    A[frontend/] --> B[src/]
    A --> C[package.json]
    A --> D[vite.config.ts]
    A --> E[index.html]
    
    B --> F[components/]
    B --> G[services/]
    B --> H[types/]
    B --> I[utils/]
    B --> J[styles/]
    B --> K[guidelines/]
    B --> L[App.tsx]
    B --> M[main.tsx]
    B --> N[index.css]
    
    F --> O[ui/]
    F --> P[核心组件]
    F --> Q[figma/]
    
    O --> R[Radix UI组件]
    P --> S[业务组件]
    
    G --> T[api.ts]
    H --> U[backend.ts]
    I --> V[dataTransform.ts]
    J --> W[globals.css]
    K --> X[Guidelines.md]
```

## 3. 核心架构图

```mermaid
graph TB
    subgraph "前端应用层"
        A[App.tsx] --> B[URLInput页面]
        A --> C[LoadingProcess页面]
        A --> D[解析结果页面]
        
        D --> E[Header组件]
        D --> F[DocumentPanel组件]
        D --> G[InterfaceList组件]
        D --> H[InterfaceEditor组件]
        D --> I[Modal组件]
    end
    
    subgraph "状态管理层"
        J[useState Hooks] --> K[接口数据状态]
        J --> L[文档段落状态]
        J --> M[UI状态管理]
        J --> N[历史记录状态]
        J --> O[设置状态]
    end
    
    subgraph "服务层"
        P[APIService] --> Q[LangGraph API]
        P --> R[数据转换服务]
    end
    
    subgraph "数据存储层"
        S[localStorage] --> T[历史记录]
        S --> U[用户设置]
    end
    
    A -.-> J
    J -.-> P
    P -.-> S
```

## 4. 组件模块图

### 4.1 页面级组件架构

```mermaid
graph TD
    A[App.tsx] --> B[输入阶段: URLInput]
    A --> C[处理阶段: LoadingProcess]
    A --> D[编辑阶段: 主界面]
    
    B --> E[URL输入框]
    B --> F[历史记录按钮]
    B --> G[设置按钮]
    
    C --> H[进度条]
    C --> I[状态提示]
    
    D --> J[Header工具栏]
    D --> K[左侧文档面板]
    D --> L[中间接口列表]
    D --> M[右侧编辑器]
    D --> N[模态框]
    
    J --> O[返回按钮]
    J --> P[接口统计]
    J --> Q[操作按钮组]
    
    K --> R[文档段落展示]
    K --> S[段落高亮]
    
    L --> T[接口列表]
    L --> U[多选功能]
    L --> V[添加接口]
    
    M --> W[字段编辑器]
    M --> X[接口预览]
    
    N --> Y[文档预览]
    N --> Z[API生成器]
    N --> AA[历史记录]
    N --> AB[设置面板]
```

### 4.2 业务组件依赖关系

```mermaid
graph LR
    A[InterfaceList] --> B[InterfaceEditor]
    A --> C[DocumentPanel]
    
    D[DocumentPanel] --> E[InterfaceList]
    D --> F[DocumentPreview]
    
    G[Header] --> H[InterfaceList]
    G --> I[APIGenerator]
    G --> J[DocumentPreview]
    
    K[URLInput] --> L[LoadingProcess]
    L --> M[主界面组件]
    
    N[HistoryPanel] --> O[URLInput]
    P[SettingsPanel] --> Q[所有组件]
```

## 5. 数据流图

### 5.1 完整数据处理流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant UI as UI组件
    participant API as APIService
    participant LG as LangGraph后端
    participant DT as 数据转换
    participant LS as localStorage
    
    U->>UI: 输入飞书URL
    UI->>API: 调用parseDocument()
    API->>LG: 发送feishu_urls
    LG-->>API: 返回ISM数据
    API->>DT: 转换数据格式
    DT->>UI: 更新组件状态
    UI->>LS: 保存历史记录
    UI-->>U: 显示解析结果
```

### 5.2 状态管理数据流

```mermaid
graph TD
    A[用户操作] --> B[setState]
    B --> C[组件重新渲染]
    B --> D[副作用处理]
    
    D --> E[localStorage更新]
    D --> F[API调用]
    D --> G[其他状态更新]
    
    E --> H[持久化存储]
    F --> I[后端数据处理]
    G --> J[UI状态同步]
    
    I --> K[新数据状态]
    K --> C
```

## 6. 状态管理架构

### 6.1 状态分类

```mermaid
graph TD
    A[React状态管理] --> B[业务数据状态]
    A --> C[UI交互状态]
    A --> D[用户偏好状态]
    
    B --> E[接口列表数据]
    B --> F[文档段落数据]
    B --> G[历史记录数据]
    
    C --> H[选中状态]
    C --> I[折叠状态]
    C --> J[模态框状态]
    C --> K[加载状态]
    
    D --> L[主题设置]
    D --> M[功能开关]
    D --> N[超时设置]
```

### 6.2 状态持久化策略

| 状态类型 | 存储方式 | 持久化时机 | 恢复时机 |
|---------|---------|-----------|----------|
| 历史记录 | localStorage | 新增记录时 | 应用启动时 |
| 用户设置 | localStorage | 设置变更时 | 应用启动时 |
| 接口数据 | 内存状态 | 实时更新 | 重新解析时 |
| UI状态 | 内存状态 | 不持久化 | 默认值初始化 |

## 7. API集成架构

### 7.1 后端服务集成

```mermaid
graph TB
    A[APIService] --> B[LangGraph Studio API]
    
    A --> C[核心方法]
    C --> D[createThread()]
    C --> E[runWorkflow()]
    C --> F[parseDocument()]
    C --> G[extractBackendData()]
    
    B --> H[线程管理]
    B --> I[工作流执行]
    B --> J[结果获取]
    
    D --> K[POST /threads]
    E --> L[POST /threads/{id}/runs/wait]
    F --> M[组合调用]
    G --> N[数据验证]
```

### 7.2 数据转换流程

```mermaid
graph LR
    A[BackendWorkflowResponse] --> B[ISMData]
    B --> C[InterfaceData[]]
    B --> D[DocumentMeta]
    
    C --> E[transformISMToInterfaces()]
    C --> F[transformISMToDocumentSections()]
    
    E --> G[APIInterface[]]
    F --> H[DocumentSection[]]
    
    G --> I[InterfaceList组件]
    H --> J[DocumentPanel组件]
```

## 8. UI组件库架构

### 8.1 Radix UI集成

```mermaid
graph TD
    A[UI组件库] --> B[Radix UI基础组件]
    A --> C[自定义业务组件]
    A --> D[样式系统]
    
    B --> E[基础交互组件]
    B --> F[布局组件]
    B --> G[表单组件]
    B --> H[反馈组件]
    
    C --> I[URLInput]
    C --> J[InterfaceList]
    C --> K[DocumentPanel]
    C --> L[InterfaceEditor]
    
    D --> M[Tailwind CSS]
    D --> N[CSS变量]
    D --> O[主题系统]
```

### 8.2 主题系统设计

```mermaid
graph TD
    A[ThemeProvider] --> B[CSS变量定义]
    A --> C[主题切换逻辑]
    A --> D[系统主题检测]
    
    B --> E[颜色变量]
    B --> F[字体变量]
    B --> G[间距变量]
    
    C --> H[深色模式]
    C --> I[浅色模式]
    C --> J[自动模式]
    
    D --> K[系统偏好]
    D --> L[本地存储]
```

## 9. 性能优化架构

### 9.1 组件优化策略

```mermaid
graph TD
    A[性能优化] --> B[组件懒加载]
    A --> C[状态优化]
    A --> D[渲染优化]
    
    B --> E[模态框懒加载]
    B --> F[面板按需渲染]
    
    C --> G[状态合并]
    C --> H[避免深层嵌套]
    
    D --> I[React.memo]
    D --> J[useMemo缓存]
    D --> K[useCallback优化]
```

### 9.2 构建优化

- **Vite配置**: 支持SWC快速编译
- **路径别名**: 简化模块导入
- **代码分割**: 自动chunk分割
- **Tree Shaking**: 移除未使用代码
- **压缩优化**: 生产环境自动压缩

## 10. 错误处理架构

### 10.1 错误处理流程

```mermaid
graph TD
    A[错误发生] --> B[错误捕获]
    B --> C[错误分类]
    
    C --> D[API错误]
    C --> E[数据转换错误]
    C --> F[UI错误]
    
    D --> G[显示错误提示]
    D --> H[记录错误日志]
    
    E --> I[显示友好提示]
    E --> J[回退到输入页面]
    
    F --> K[显示警告信息]
    F --> L[尝试恢复状态]
```

### 10.2 用户反馈系统

- **成功通知**: Sonner成功提示
- **错误提示**: 详细的错误信息
- **加载状态**: 进度条和状态文本
- **操作确认**: 关键操作二次确认

## 总结

这个前端项目采用了现代化的React技术栈，通过清晰的架构分层实现了：

1. **模块化设计**: 组件职责单一，便于维护和扩展
2. **类型安全**: TypeScript全面覆盖，减少运行时错误
3. **用户体验**: 流畅的交互和状态管理
4. **性能优化**: 多种优化策略确保响应速度
5. **错误处理**: 完善的错误捕获和用户反馈机制

整个架构支持从飞书文档解析到API接口生成的完整工作流程，为用户提供了直观高效的操作体验。