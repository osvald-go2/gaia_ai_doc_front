## 目标
- 把 `WorkflowPreview` 中的 SQL `<textarea>` 替换成 VSCode 同款编辑器体验（光标、行号、快捷键、主题适配）。
- 保留现有“复制”按钮行为，复制用户当前编辑的 SQL 内容。

## 技术选型
- 推荐：Monaco Editor（VS Code 内置编辑器），使用 React 封装包 `@monaco-editor/react`，集成简单并已支持 Vite [@monaco-editor/react 文档](https://www.npmjs.com/package/@monaco-editor/react)；其 README 也给出在 Vite 下的 worker 配置示例 [monaco-react README](https://github.com/suren-atoyan/monaco-react)。
- 备选：`vite-plugin-monaco-editor` 精简加载语言/worker，降低包体，适合生产优化 [vite-plugin-monaco-editor](https://www.npmjs.com/package/vite-plugin-monaco-editor) [GitHub](https://github.com/vdesjs/vite-plugin-monaco-editor)。
- 如需更轻量：CodeMirror 6（不完全 VSCode 手感），可用 `@uiw/react-codemirror` + SQL 扩展；本次优先使用 Monaco。

## 依赖安装
- 基础依赖：
  - `npm i monaco-editor @monaco-editor/react`
- （可选）生产优化：
  - `npm i -D vite-plugin-monaco-editor`

## Vite 下的 Worker 配置（如需）
- 方案 A：直接用 `@monaco-editor/react`（通常无需额外配置）。
- 方案 B：显式注册 worker，按 Monaco 官方/社区示例在 Vite 中导入 `?worker` 并设置 `MonacoEnvironment.getWorker`：
  - 参考讨论与示例：[Vite Discussions 1791](https://github.com/vitejs/vite/discussions/1791) 与 Monaco 官方 ESM/Vite 示例链接（该讨论中提供）
  - 示例代码：
    ```ts
    // src/monaco-workers.ts
    import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
    // SQL 使用的是基础 editor worker，无专属语言 worker
    // 如后续要支持 TS/JSON/CSS/HTML 再按需引入对应 worker

    ;(self as any).MonacoEnvironment = {
      getWorker(_: any, label: string) {
        return new editorWorker()
      }
    }
    ```
  - 在应用入口（如 `main.tsx`）最先导入一次：`import './monaco-workers'`。
- 方案 C：使用 `vite-plugin-monaco-editor` 自动处理 worker，限制语言集合，体积更小 [插件文档](https://www.npmjs.com/package/vite-plugin-monaco-editor)。

## 组件实现
- 新增 `src/components/SqlMonacoEditor.tsx`（封装 Monaco 编辑器）：
  - 使用 `Editor` 组件：
    ```tsx
    import Editor, { OnChange } from '@monaco-editor/react'

    export default function SqlMonacoEditor({ value, onChange, theme }: {
      value: string
      onChange: (v: string) => void
      theme: 'dark' | 'claude'
    }) {
      const mappedTheme = theme === 'dark' ? 'vs-dark' : 'vs'
      return (
        <Editor
          height="100%"
          defaultLanguage="sql"
          language="sql"
          value={value}
          onChange={(v) => onChange(v ?? '')}
          theme={mappedTheme}
          options={{
            fontFamily: 'Consolas, Monaco, Courier New, monospace',
            fontSize: 12,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'line',
          }}
        />
      )
    }
    ```
- 主题增强（可选）：在 `useTheme()` 变化时用 `monaco.editor.defineTheme` 将应用 CSS 变量映射到 Monaco 颜色（如 `editor.background` / `editor.foreground` 等），以实现更贴近现有暗色/Claude 主题的观感 [monaco-react README 提及 loader 集成](https://github.com/suren-atoyan/monaco-react)。

## 页面替换
- 在 `src/components/WorkflowPreview.tsx` 将原 `<textarea>` 替换为 `SqlMonacoEditor`：
  - 编辑值仍绑定到现有 `sqlByNode[selectedNode.id]` 状态，并在 `onChange` 中更新；
  - 复制按钮从当前状态取值即可，无需调整逻辑；
  - 容器高度保持与现状一致（`height: calc(100% - 38px)` 的可视区域），编辑器 `height="100%"` 自动填满。

## 性能与包体控制（可选）
- 若采用 `vite-plugin-monaco-editor`：
  - 在 `vite.config.ts` 中启用插件，仅包含必要 worker，例如只保留 `editorWorkerService`：
    ```ts
    import MonacoEditorPlugin from 'vite-plugin-monaco-editor'

    export default defineConfig({
      plugins: [
        react(),
        MonacoEditorPlugin({ languageWorkers: ['editorWorkerService'] })
      ]
    })
    ```
  - 参考插件文档说明与注意事项 [npm](https://www.npmjs.com/package/vite-plugin-monaco-editor) / [GitHub](https://github.com/vdesjs/vite-plugin-monaco-editor)。

## 交付内容
- 新增 `SqlMonacoEditor.tsx` 封装组件；
- 更新 `WorkflowPreview.tsx` 以替换 `<textarea>`；
- （如采用方案 B/C）新增 `monaco-workers.ts` 和/或修改 `vite.config.ts`；
- 主题适配实现，使暗色/Claude 保持一致观感。

## 参考资料
- `@monaco-editor/react` 集成与用法（含无需改 bundler的说明）：https://www.npmjs.com/package/@monaco-editor/react
- monaco-react README（含 Vite worker 配置示例）：https://github.com/suren-atoyan/monaco-react
- Vite 讨论与 Monaco ESM/worker 示例：https://github.com/vitejs/vite/discussions/1791
- `vite-plugin-monaco-editor`：https://www.npmjs.com/package/vite-plugin-monaco-editor 与 https://github.com/vdesjs/vite-plugin-monaco-editor

---
请确认采用 Monaco + `@monaco-editor/react` 的实现方案；若同意，我将按上述步骤创建封装组件并替换现有文本框，同时做好主题与性能配置。