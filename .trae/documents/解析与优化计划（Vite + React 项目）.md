## 项目概览
- 架构：`Vite + React 18 + SWC`，入口 `src/main.tsx` 渲染 `App`，未使用路由
- 构建：`vite.config.ts` 启用 `@vitejs/plugin-react-swc` 与 `vite-plugin-monaco-editor`，`build.target: esnext`，产物在 `build/`
- 依赖：Radix UI 组件族、`class-variance-authority` + `tailwind-merge` 组合；Monaco Editor；未引入 Redux/Zustand 等全局状态库
- 样式：Tailwind v4 生成样式在 `src/index.css`；主题与令牌在 `src/styles/globals.css`（使用 `@theme`、`@layer`、`@apply`）
- API：`src/services/api.ts` 封装基于 `fetch` 的服务层，硬编码 `API_BASE_URL`（`http://localhost:8123`）
- 业务：核心页面布局在 `src/pages/GeneratorLayout.tsx`，三栏布局 + 滚动区；主逻辑集中在 `src/App.tsx`
- 质量：无 `tsconfig.json`、无 ESLint/Prettier、无测试框架、无 CI/CD；多处中文硬编码文案，无 i18n

## 关键证据
- 入口：`src/main.tsx:7` 直接 `createRoot(...).render(<App />)`
- 构建：`vite.config.ts:8-13` 插件；`vite.config.ts:57-63` 构建/开发配置
- UI 组件：`src/components/ui/button.tsx:7-35` 使用 `cva` + `cn`；`src/components/ui/utils.ts:1-6` 提供 `cn`
- 布局：`src/pages/GeneratorLayout.tsx:70-151` 三栏 `PanelGroup` + Radix ScrollArea
- API：`src/services/api.ts:6` 基址常量；`src/services/api.ts:54-81` 请求封装；`src/services/api.ts:137-145` 文档解析工作流
- 样式：`src/index.css:1` Tailwind v4 产物；`src/styles/globals.css:124-163` 主题令牌；`src/styles/globals.css:165-175` 基础应用（`@apply bg-background`）
- 依赖：`package.json:5-53` 全部 UI/工具库；`package.json:60-63` 脚本（`dev` 端口 6790 与 `vite.config.ts` 端口 3000 不一致）

## 问题与机会
- 环境配置缺失：后端地址硬编码；无 `.env`/`import.meta.env`；无法按环境切换
- 类型与规范：缺少 `tsconfig.json`（路径别名与严格模式未配置）；无 ESLint/Prettier（代码一致性与安全规则缺失）
- 测试与质量：无 Vitest/RTL；关键数据转换未覆盖单测
- 性能与体积：Monaco 较重；模态与编辑器未懒加载；`build.target` 设为 `esnext` 兼容性偏低
- 路由与可分享性：未集成路由或 URL 片段同步（无法直接分享解析态）
- i18n：中文硬编码，无国际化框架；后续多语言扩展成本高
- 端口与导入约定：`dev` 脚本端口与 `vite.config.ts` 不一致；存在版本后缀别名导入如 `lucide-react@0.487.0`，不利于统一风格

## 优化目标
- 实现按环境可配置的后端地址与运行时配置
- 强化类型与规范，提升可维护性与团队协作一致性
- 降低首屏体积与提升交互性能（懒加载/拆包/按需加载）
- 引入基础路由与 URL 状态同步，提高可分享性与可导航性
- 建立基础测试与 CI，确保迭代质量
- 准备 i18n 能力，以最小改动实现中英切换

## 实施方案
### Phase 1：基础与规范
- 新增 `tsconfig.json`：启用 `strict`、`noImplicitAny`、`paths`（映射 `@/*` 到 `src/*`）
- 统一端口：将 `dev` 脚本端口改为 `3000` 或删除脚本端口，完全由 `vite.config.ts` 管理
- 规范导入：去除版本后缀式别名，统一常规包名导入（保留锁文件确保版本）
- 添加 ESLint + Prettier：使用 `eslint-config-react-app` 或 `eslint-config-next` 同类规则；引入 TypeScript/React/Import 排序规则

### Phase 2：环境与服务层
- 引入 `.env` 系列（`VITE_API_BASE_URL`），在 `api.ts` 读取 `import.meta.env.VITE_API_BASE_URL`
- 支持运行时配置：可选在 `public/runtime-config.js` 注入 `window.__ENV.API_BASE_URL`，以兼容容器化部署
- 增强 API 封装：
  - 添加请求超时（`AbortController` + 定时器）
  - 统一错误类型与消息（后端错误字段、网络错误、解析错误）
  - 可选重试策略（幂等场景）与全局 `onError` 钩子

### Phase 3：性能与体验
- 代码拆分与懒加载：
  - 异步加载 Monaco 相关组件（`SqlMonacoEditor`、大型模态 `APIGenerator`/`DocumentPreview`）
  - 使用 `React.lazy + Suspense` 与分包注释
- 仅在需要时加载重资源：避免首屏引入 `monaco-editor` 与图表等
- 资源优化：`build.target` 调整为 `es2019`（或 `modules`），保留现代浏览器兼容；开启 `manualChunks` 做更细粒度拆分

### Phase 4：路由与可分享性
- 引入 `react-router-dom` 的基础路由
  - `/` 输入页；`/parsed` 解析态（URL 查询参数携带 `url`、已选接口 ID 等）
  - 将现有 `step` 状态映射到路由，保留原逻辑兼容
- URL 状态同步：用 `URLSearchParams` 同步选择状态与高亮段落 ID，便于分享定位

### Phase 5：测试与 CI
- 集成 Vitest + React Testing Library
  - 单测：`utils/dataTransform.ts`（方法：`transformISMToInterfaces`、`transformISMToDocumentSections`、`validateBackendData`）
  - 服务层：`api.ts` 的错误分支与成功分支（Mock `fetch`）
- 在 `package.json` 增加 `test`、`test:watch`、`lint` 脚本
- GitHub Actions：`node@lts` + 缓存 + `install`/`lint`/`test`/`build` 流水线

### Phase 6：国际化
- 引入 `react-i18next`
  - 资源：`src/i18n/locales/zh-CN.json`、`en-US.json`
  - 渐进替换：将 UI 文案提取到字典，先覆盖主页面与通知文案
- 语言切换：利用现有 `ThemeProvider` 的模式，在 `App` 顶层新增 `I18nProvider` 与语言选择

### Phase 7：样式与主题
- 确认 `globals.css` 的引入路径：在 `main.tsx` 明确导入或通过 PostCSS/Tailwind v4 合并流程确保其生效
- 组件主题一致性：统一 `focus-visible`、`aria-*` 与数据槽位（如 `[data-slot="button"]`）以提升可访问性
- 清理未使用类与样式，避免冲突与重复定义

## 验收标准
- 本地可根据 `.env` 切换后端地址；生产可注入运行时配置
- `npm run lint`、`npm run test`、`npm run build` 均通过；CI 绿灯
- 首屏包体减少（Monaco 不在首屏加载）；交互打开时懒加载
- 路由可分享解析态，返回输入页与解析页切换自然
- 主要 UI 文案支持中英切换；默认中文

## 预计影响范围与风险控制
- 低风险：`tsconfig`、ESLint/Prettier、端口统一（不影响业务逻辑）
- 中风险：服务层改造与路由引入（将采用兼容策略，保留现有状态机）
- 性能优化：以按需加载为主，不改变组件对外接口
- 回滚策略：逐阶段提交，任何阶段可独立回滚；保留原有实现分支

如确认以上方案，我将分阶段实施，并在每阶段交付可运行的结果与对比数据。