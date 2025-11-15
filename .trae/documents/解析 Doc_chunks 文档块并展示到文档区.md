## 目标
- 支持解析后端返回的 `doc_chunks` 文档块属性，按块生成文档段落展示到左侧“文档内容”列。
- 每个块的 `content` 为正文，保留块的 `title`/归属关系（若有）。

## 兼容数据形态
- 顶层：`data.doc_chunks?: DocChunk[]`
- ISM 层：`data.ism.doc_chunks?: DocChunk[]`
- 接口层：`InterfaceData.doc_chunks?: DocChunk[]`（归属于具体接口）
- DocChunk 结构：`{ id?: string; title?: string; content: string; is_api?: boolean; section_id?: string }`

## 类型更新
- 更新 `src/types/backend.ts`：
  - 新增 `export interface DocChunk { id?: string; title?: string; content: string; is_api?: boolean; section_id?: string }`
  - 在 `ISMData` 与 `InterfaceData` 中增加可选 `doc_chunks?: DocChunk[]`
  - 在 `BackendWorkflowResponse` 顶层增加可选 `doc_chunks?: DocChunk[]`

## 文档段落生成
- 更新 `transformISMToDocumentSections(ism, rawDocs?, topDocChunks?)`：
  - 优先处理顶层 `doc_chunks`：对每个块生成 `DocumentSection`（`id: doc-chunk-${i}`, `title: chunk.title || '文档块 i'`, `content: chunk.content`, `isAPI: !!chunk.is_api`）。
  - 然后处理 `ism.doc_chunks`（如果存在），方式同上。
  - 再处理每个 `interface.doc_chunks`：将其追加为接口相关段落，`id: section-interface-chunk-${interfaceIndex}-${j}`，`title: interface.name + ' · ' + (chunk.title || '文档块 j')`，`isAPI: true`。
  - 保留现有 `raw_docs` 段落作为兜底；避免重复（对 `content` 做去重）。

## 展示
- 左侧“文档内容”列已使用 `DocumentPanel` 渲染 `DocumentSection[]`，不改组件结构。
- 文本已加入 `break-words` 与响应式内边距，窄列适配良好。

## 验收
- 如果后端返回任一层级的 `doc_chunks`，都能在文档列展示。
- 接口级块显示在对应接口标题下；其它块显示在普通文档区域。
- 不影响原有接口列表与配置区逻辑。

确认后我将更新类型与数据转换函数，并把 `doc_chunks` 内容展示到文档区。