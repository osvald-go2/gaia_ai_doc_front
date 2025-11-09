/**
 * API服务层 - 调用后端LangGraph接口
 * 完全适配LangGraph Studio API格式
 */

const API_BASE_URL = 'http://localhost:8123';

export interface WorkflowRequest {
  feishu_urls: string[];
  feishu_url?: string;
  user_intent?: string;
  trace_id?: string;
}

export interface WorkflowResponse {
  // 后端LangGraph直接返回完整的工作流结果
  feishu_urls?: string[];
  user_intent?: string;
  trace_id?: string;
  raw_docs?: string[];
  ism?: any;
  diag?: any;
  plan?: any[];
  final_flow_json?: string;
  mcp_payloads?: any[];
  response?: any;
  // LangGraph Studio 可能的错误字段
  __error__?: any;
}

export interface Thread {
  thread_id: string;
  created_at: string;
  updated_at: string;
  metadata: any;
  status: string;
  config: any;
  values: any;
}

// 导入后端数据类型
import { BackendWorkflowResponse } from '../types/backend';

// 重新导出供其他模块使用
export type { BackendWorkflowResponse };

class APIService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  /**
   * 创建新的thread
   */
  async createThread(): Promise<{ thread_id: string }> {
    return this.request('/threads', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  /**
   * 运行工作流并等待完成
   */
  async runWorkflow(
    threadId: string,
    input: WorkflowRequest
  ): Promise<WorkflowResponse> {
    return this.request(`/threads/${threadId}/runs/wait`, {
      method: 'POST',
      body: JSON.stringify({
        assistant_id: 'agent',
        input: input,
      }),
    });
  }

  /**
   * 获取thread信息
   */
  async getThread(threadId: string): Promise<Thread> {
    return this.request(`/threads/${threadId}`);
  }

  /**
   * 检查API服务状态
   */
  async checkHealth(): Promise<{ message: string; version: string }> {
    return this.request('/');
  }

  /**
   * 便捷方法：创建thread并运行工作流
   */
  async createAndRunWorkflow(input: WorkflowRequest): Promise<WorkflowResponse> {
    // 创建thread
    const { thread_id } = await this.createThread();

    // 运行工作流
    return this.runWorkflow(thread_id, input);
  }

  /**
   * 解析飞书文档并生成接口配置
   */
  async parseDocument(feishuUrl: string): Promise<WorkflowResponse> {
    const input: WorkflowRequest = {
      feishu_urls: [feishuUrl],
      user_intent: 'generate_crud',
      trace_id: `frontend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    return this.createAndRunWorkflow(input);
  }

  /**
   * 提取并验证后端返回的数据
   */
  extractBackendData(response: WorkflowResponse): BackendWorkflowResponse | null {
    // 后端直接返回完整的WorkflowResponse结构
    if (response.ism) {
      // 验证数据结构
      if (response.ism.doc_meta && response.ism.interfaces) {
        return response as BackendWorkflowResponse;
      }
    }

    // 兼容可能的values包装格式
    if (response.values && response.values.ism) {
      return response.values as BackendWorkflowResponse;
    }

    // 兼容result包装格式
    if (response.result && response.result.ism) {
      return response.result as BackendWorkflowResponse;
    }

    return null;
  }

  /**
   * 检查响应是否成功
   */
  isSuccessfulResponse(response: WorkflowResponse): boolean {
    // 检查是否有错误
    if (response.__error__) {
      console.error('Backend error:', response.__error__);
      return false;
    }

    // 检查是否有有效数据
    const backendData = this.extractBackendData(response);
    return backendData !== null;
  }

  /**
   * 获取错误信息
   */
  getErrorMessage(response: WorkflowResponse): string {
    if (response.__error__) {
      return response.__error__.message || response.__error__.error || '未知错误';
    }

    // 检查是否有数据但没有ISM
    if (!response.ism) {
      return '后端未返回有效的ISM数据';
    }

    // 检查ISM结构
    if (!response.ism.doc_meta) {
      return '后端返回的ISM数据缺少文档元信息';
    }

    if (!response.ism.interfaces) {
      return '后端返回的ISM数据缺少接口信息';
    }

    return '后端处理失败';
  }
}

export const apiService = new APIService();
export default apiService;