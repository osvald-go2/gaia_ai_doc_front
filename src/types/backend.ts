/**
 * 后端API返回的数据类型定义
 */

// 文档块数据结构
export interface DocChunk {
  // 基础信息
  chunk_id: string;
  source_doc_index: number;
  chunk_type: 'header_section' | 'paragraph' | 'large_text_split' | 'full_document';
  content: string;
  position: number;
  line_start: number;
  line_end: number;

  // 上下文信息
  prev_chunk_id?: string;
  next_chunk_id?: string;
  context_before?: string;
  context_after?: string;

  // 元数据
  metadata: {
    word_count: number;
    char_count: number;
    line_count: number;
    has_grid: boolean;
    has_code: boolean;
    importance_score: number; // 0-1
    processing_priority: number; // 1-4
  };
}

// 文档切分元数据
export interface ChunkMetadata {
  total_chunks: number;
  total_documents: number;
  chunking_strategy: {
    method: 'rule_based' | 'ai_based';
    max_chunk_size: number;
    min_chunk_size: number;
    split_by_headers: boolean;
    split_by_paragraphs: boolean;
    preserve_context: boolean;
  };
  processing_stats: {
    chunks_with_grid: number;
    chunks_with_code: number;
    average_chunk_size: number;
    processing_time_ms: number;
  };
}

// 后端LangGraph工作流的完整响应
export interface BackendWorkflowResponse {
  // 输入参数
  feishu_urls: string[];
  user_intent: string;
  trace_id: string;

  // 原始文档内容
  raw_docs: string[];

  // 文档块数据
  doc_chunks?: DocChunk[];
  chunk_metadata?: ChunkMetadata;
  use_chunked_processing?: boolean;

  // ISM数据 - 核心结构化数据
  ism: ISMData;

  // 诊断信息
  diag: Diagnostics;

  // 执行计划
  plan: PlanStep[];

  // 最终流程JSON
  final_flow_json: string;

  // MCP载荷数组
  mcp_payloads: MCPPayload[];

  // 最终响应
  response: FinalResponse;
}

// ISM (Interface Semantic Model) 数据结构
export interface ISMData {
  doc_meta: DocumentMeta;
  interfaces: InterfaceData[];
  entities?: EntityData[];
  actions?: ActionData[];
  views?: ViewData[];
  parsing_statistics?: ParsingStatistics;
  doc_chunks?: DocChunk[]; // ISM层也可能包含文档块
  __pending__?: any[];
  __key__?: string;
  __processing_method?: string;
  __version?: string;
}

// 文档元数据
export interface DocumentMeta {
  title: string;
  url: string;
  version?: string;
  parsing_mode?: string;
  total_chunks?: number;
  chunks_with_grid?: number;
}

// 接口数据定义
export interface InterfaceData {
  id: string;
  name: string;
  type: string;
  description?: string;
  fields?: InterfaceField[];
  operations?: string[];
  source_chunk_ids?: string[];
  // 兼容旧格式
  dimensions?: DimensionData[];
  metrics?: MetricData[];
  // 文档块支持
  doc_chunks?: DocChunk[];
}

// 接口字段定义（新格式）
export interface InterfaceField {
  name: string;
  expression: string;
  data_type: string;
  required: boolean;
  description?: string;
}

// 实体数据定义
export interface EntityData {
  id: string;
  name: string;
  description?: string;
  fields: InterfaceField[];
  source_interface_id?: string;
}

// 行为数据定义
export interface ActionData {
  id: string;
  name: string;
  description?: string;
  type: string;
  parameters?: Record<string, any>;
}

// 视图数据定义
export interface ViewData {
  id: string;
  name: string;
  description?: string;
  type: string;
  config?: Record<string, any>;
}

// 解析统计信息
export interface ParsingStatistics {
  total_chunks: number;
  chunks_with_grid: number;
  interfaces_generated: number;
  entities_generated: number;
  processing_time_ms?: number;
}

// 维度数据
export interface DimensionData {
  name: string;
  expression: string;
  data_type: string;
  required: boolean;
}

// 指标数据
export interface MetricData {
  name: string;
  expression: string;
  data_type: string;
  required: boolean;
}

// 诊断信息
export interface Diagnostics {
  fixups: any[];
  warnings: string[];
  errors: any[];
}

// 计划步骤
export interface PlanStep {
  tool: string;
  args: {
    graph_json: string;
    interface_id: string;
    interface_name: string;
    [key: string]: any;
  };
}

// MCP载荷
export interface MCPPayload {
  tool: string;
  args: {
    graph_json: string;
    interface_id: string;
    interface_name: string;
    validation_passed?: boolean;
    [key: string]: any;
  };
}

// 最终响应
export interface FinalResponse {
  trace_id: string;
  status: string;
  ism: ISMData;
  plan: PlanStep[];
}