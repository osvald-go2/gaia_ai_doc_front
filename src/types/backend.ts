/**
 * 后端API返回的数据类型定义
 */

// 后端LangGraph工作流的完整响应
export interface BackendWorkflowResponse {
  // 输入参数
  feishu_urls: string[];
  user_intent: string;
  trace_id: string;

  // 原始文档内容
  raw_docs: string[];

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
  __pending__?: any[];
  __key__?: string;
}

// 文档元数据
export interface DocumentMeta {
  title: string;
  url: string;
  version?: string;
  parsing_mode?: string;
}

// 接口数据定义
export interface InterfaceData {
  id: string;
  name: string;
  type: string;
  dimensions: DimensionData[];
  metrics: MetricData[];
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