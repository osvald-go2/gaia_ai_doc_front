## 目标
- 文档分栏内容统一以 Markdown 风格渲染（标题、段落、列表、链接、表格、代码块）。
- 滚动条默认隐藏，仅在鼠标悬停或滚动时出现，交互自然且与主题协调。

## 改动范围
- 文档分栏组件：`src/components/DocumentPanel.tsx`
- 统一滚动容器组件：`src/components/ui/scroll-area.tsx`
- 与滚动条相关的全局样式：`src/styles/globals.css`

## 实现步骤
### 1) Markdown 渲染统一
- 使用现有 `react-markdown + remark-gfm` 渲染文档内容（仅渲染后端 `doc_chunks.content`），保持我们当前的“grid_column 上下结构”处理。
- 为 Markdown 容器增加稳定选择器以补充样式：`data-slot="markdown"`，并保留/增强列表样式（子弹点、缩进、间距）。
- 组件映射：统一为 `p / h1-h4 / ul / ol / li / a / code / pre / table / thead / tbody / tr / th / td` 添加主题友好的类。
- 代码位置：
  - 文档 Markdown 容器：`src/components/DocumentPanel.tsx:160, 180, 206, 218`
  - grid_column 的上下结构处理与前后文本整合：`src/components/DocumentPanel.tsx:149-214`

### 2) 滚动条交互改为“悬停显示”
- 将文档分栏的滚动容器切换为悬停显示：`ScrollArea` 的 `type="hover"`。
- 统一滚动容器组件默认行为改为悬停显示，去掉强制常显与强制挂载：
  - `src/components/ui/scroll-area.tsx:14` 移除 `type="always"`，默认改为 `type="hover"`（保留可通过 props 覆盖）。
  - `src/components/ui/scroll-area.tsx:37` 移除 `forceMount`，依赖 Radix 的显示状态（`data-state`）在悬停/滚动时展示滚动条。
- 文档分栏使用：`src/components/DocumentPanel.tsx:75` 把 `type="always"` 改为 `type="hover"`。

### 3) 清理与微调样式
- 移除目前强制常显滚动条的全局样式，以免与悬停逻辑冲突：
  - 删除或注释 `[data-slot="scroll-area-viewport"]::-webkit-scrollbar*` 相关规则：`src/styles/globals.css:220-236`（此前用于固定可见）。
- 保留 Markdown 列表样式与主题色标记：
  - `[data-slot="markdown"] ul/ol/li` 的列表样式与 `li::marker` 主题色：`src/styles/globals.css` 已存在，确认不影响滚动条表现。

## 验证
- 本地启动后在文档分栏进行以下验证：
  - 内容以 Markdown 风格渲染，列表为 `ul>li` 带子弹点与缩进。
  - 不触发滚动时滚动条隐藏；鼠标悬停或滚动时滚动条平滑出现；移开后隐藏。
  - grid_column：上图下文，且前置与后置文本均正常渲染；滚动过程中交互自然。
- 主题切换（`dark`/`claude`）下滚动条、列表与链接颜色与主题协调。