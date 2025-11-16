## 问题分析
- 文档块中存在“参考口径: 链接 + 若干项以 `-` 连接的内联文本”，被渲染为同一段 `<p>`，没有列表样式。
- 目前只在遇到行首 `- ` 才渲染为列表；对“内联分隔”的列表（如 `消耗 - CTR - CVR - CPA - SHOW`）未转换。
- 滚动条逻辑已切换为 `hover`，但需确保与内容渲染的容器、样式不冲突并生效。

## 目标
- 将“内联分隔”的列表智能转换为 Markdown 列表（`ul > li`），并与主题色保持一致。
- 文档分栏滚动条默认隐藏，鼠标悬停/滚动时显示。

## 具体实现
### 1) 增加 Markdown 规范化函数（就地实现）
- 在 `src/components/DocumentPanel.tsx` 内新增 `normalizeMarkdown(text: string): string`：
  1. 移除 CR、去掉行首缩进：`text.replace(/\r/g, '').replace(/^\s+/gm, '')`
  2. 在普通段落与列表的首个 `- ` 之间插入空行：`text.replace(/([^\n])\n(?=-\s)/g, '$1\n\n')`
  3. 处理“内联分隔”为列表：
     - 捕获 `参考口径|维度|指标` 前缀后的内联块，按 `\s-\s` / `、` / `，` 分割，生成 `- 项` 列表，前缀保留为上一行
     - 通用规则：将任何含 `\s-\s` 且非行首 `-` 的行转为多行列表
     - 避免误伤范围如 `0-10`（仅转换有空格的分隔符 `\s-\s`）
- 在三个入口调用规范化函数：
  - `beforeGrid`（grid 前的说明）：`beforeNormalized = normalizeMarkdown(beforeGrid)`
  - `normalizedText`（grid 的右侧内容块）：`normalizedText = normalizeMarkdown(textBlockRaw)`
  - `afterGrid`（grid 之后尾部内容）：`afterGridNormalized = normalizeMarkdown(afterGrid)`
- 对非 grid 的普通 `section.content` 也调用规范化，保证全局一致。

### 2) 保持主题一致的样式映射
- 继续使用现有 `react-markdown + remark-gfm` 渲染，并在 `components` 中统一赋样式：
  - `p`: `mb-2 text-foreground/80`
  - `ul`: `list-disc ml-6 space-y-1`
  - `li`: `text-foreground/80`
  - `a`: `text-primary underline underline-offset-2`
- 保留全局列表样式与主题色子弹点：`src/styles/globals.css` 的 `[data-slot="markdown"] li::marker { color: var(--primary); }`

### 3) 滚动条悬停显示确保生效
- 使用 `ScrollArea type="hover"`：已设置 `src/components/DocumentPanel.tsx:77`
- 滚动条组件默认 `forceMount=false`，并根据 `data-state` 切换透明度：`src/components/ui/scroll-area.tsx:43-60`
- 已移除强制常显系统滚动条样式，避免冲突：`src/styles/globals.css` 清理完成。

## 验证
- 文档块中的“参考口径 + 消耗 - CTR - CVR - CPA - SHOW”应显示为：上一行段落 + 下一行 `ul>li` 列表。
- 鼠标悬停文档区域或滚动时，滚动条出现；移走鼠标后隐藏。
- 切换 `dark/claude` 主题，子弹点与链接颜色使用 `--primary`，文本为 `text-foreground/80`。

## 兼容性与安全
- 仅在当前文件内新增小型规范化函数，不改动后端数据模型，不新增依赖；对范围“0-10”不会误判。
- 保留 grid 上下结构与前后文渲染逻辑，低风险、易回滚。