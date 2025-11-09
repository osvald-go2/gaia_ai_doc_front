/**
 * 数据转换工具 - 将后端LangGraph结果转换为前端接口格式
 * 完全适配后端真实数据结构
 */

import { APIInterface } from '../components/InterfaceList';
import { BackendWorkflowResponse, ISMData, InterfaceData, DimensionData, MetricData } from '../types/backend';

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  isAPI: boolean;
}

/**
 * 将后端ISM数据转换为前端接口配置
 */
export function transformISMToInterfaces(ism: ISMData): APIInterface[] {
  if (!ism || !ism.interfaces || !Array.isArray(ism.interfaces)) {
    console.warn('Invalid ISM data structure', ism);
    return [];
  }

  return ism.interfaces.map((interfaceData: InterfaceData, index: number) => {
    const interfaceId = `api-${interfaceData.id || index}`;

    return {
      id: interfaceId,
      name: interfaceData.name || `接口${index + 1}`,
      method: determineHttpMethod(interfaceData),
      endpoint: generateEndpoint(interfaceData),
      sourceSection: `section-${index + 1}`,
      requestFields: transformRequestFields(interfaceData),
      responseFields: transformResponseFields(interfaceData),
    };
  });
}

/**
 * 根据接口类型确定HTTP方法
 */
function determineHttpMethod(interfaceData: InterfaceData): string {
  const interfaceType = interfaceData.type || '';
  const interfaceName = interfaceData.name || '';

  // 根据接口类型推断HTTP方法
  if (interfaceType.includes('trend') || interfaceType.includes('analysis')) {
    return 'GET';
  } else if (interfaceType.includes('filter') || interfaceType.includes('search')) {
    return 'GET';
  } else if (interfaceType.includes('create') || interfaceName.includes('创建')) {
    return 'POST';
  } else if (interfaceType.includes('update') || interfaceName.includes('更新')) {
    return 'PUT';
  } else if (interfaceType.includes('delete') || interfaceName.includes('删除')) {
    return 'DELETE';
  } else if (interfaceType.includes('display') || interfaceType.includes('list')) {
    return 'GET';
  }

  // 默认为GET
  return 'GET';
}

/**
 * 生成API端点路径
 */
function generateEndpoint(interfaceData: InterfaceData): string {
  const interfaceName = interfaceData.name || '';
  const interfaceType = interfaceData.type || '';

  // 根据接口名称和类型生成合适的端点
  if (interfaceName.includes('趋势') || interfaceType.includes('trend')) {
    return '/api/v1/trends';
  } else if (interfaceName.includes('筛选') || interfaceType.includes('filter')) {
    return '/api/v1/filter';
  } else if (interfaceName.includes('指标') || interfaceType.includes('analytics')) {
    return '/api/v1/metrics';
  } else if (interfaceName.includes('素材') || interfaceType.includes('material')) {
    return '/api/v1/materials';
  } else if (interfaceName.includes('公司') || interfaceType.includes('company')) {
    return '/api/v1/companies';
  }

  // 默认端点
  return '/api/v1/data';
}

/**
 * 转换请求字段
 */
function transformRequestFields(interfaceData: InterfaceData): any[] {
  const fields: any[] = [];

  // 处理维度字段作为请求参数
  if (interfaceData.dimensions && Array.isArray(interfaceData.dimensions)) {
    interfaceData.dimensions.forEach((dimension: DimensionData, index: number) => {
      const isRequired = dimension.required || false;

      // 时间维度通常作为查询参数
      if (dimension.data_type === 'date' || dimension.name.includes('天')) {
        fields.push({
          id: `req-dim-${index}`,
          name: dimension.name || `dimension${index}`,
          expression: 'query.date',
          required: isRequired,
          type: 'string',
          description: `${dimension.name || '时间'}参数`,
        });
      } else {
        // 其他维度作为查询参数
        fields.push({
          id: `req-dim-${index}`,
          name: dimension.name || `dimension${index}`,
          expression: `query.${toCamelCase(dimension.name || `param${index}`)}`,
          required: isRequired,
          type: mapDataType(dimension.data_type),
          description: `${dimension.name || '维度'}参数`,
        });
      }
    });
  }

  // 处理指标字段作为请求参数（主要用于筛选）
  if (interfaceData.metrics && Array.isArray(interfaceData.metrics)) {
    interfaceData.metrics.forEach((metric: MetricData, index: number) => {
      if (metric.required) {
        fields.push({
          id: `req-metric-${index}`,
          name: metric.name || `metric${index}`,
          expression: `query.${toCamelCase(metric.name || `metric${index}`)}`,
          required: true,
          type: mapDataType(metric.data_type),
          description: `${metric.name || '指标'}筛选条件`,
        });
      }
    });
  }

  // 添加通用的分页参数（对于列表类型的接口）
  if (interfaceData.type?.includes('display') || interfaceData.type?.includes('list')) {
    fields.push(
      {
        id: 'req-page',
        name: 'page',
        expression: 'query.page',
        required: true,
        type: 'number',
        description: '页码',
      },
      {
        id: 'req-pageSize',
        name: 'pageSize',
        expression: 'query.pageSize',
        required: true,
        type: 'number',
        description: '每页数量',
      }
    );
  }

  return fields;
}

/**
 * 转换响应字段
 */
function transformResponseFields(interfaceData: InterfaceData): any[] {
  const fields: any[] = [];

  // 添加基础响应字段
  fields.push(
    {
      id: 'resp-success',
      name: 'success',
      expression: 'response.success',
      description: '请求是否成功',
      required: true,
      type: 'boolean',
    },
    {
      id: 'resp-message',
      name: 'message',
      expression: 'response.message',
      description: '响应消息',
      required: true,
      type: 'string',
    }
  );

  // 判断是否为列表类型的接口
  const isListType = interfaceData.type?.includes('display') ||
                    interfaceData.type?.includes('list') ||
                    interfaceData.dimensions?.some((d: DimensionData) => d.name.includes('天'));

  // 处理维度字段作为响应数据
  if (interfaceData.dimensions && Array.isArray(interfaceData.dimensions)) {
    interfaceData.dimensions.forEach((dimension: DimensionData, index: number) => {
      const fieldName = dimension.name || `dimension${index}`;
      const expression = isListType
        ? `response.data.items[].${fieldName}`
        : `response.data.${fieldName}`;

      fields.push({
        id: `resp-dim-${index}`,
        name: isListType ? `items[].${fieldName}` : fieldName,
        expression: expression,
        description: `${fieldName}信息`,
        required: dimension.required || false,
        type: mapDataType(dimension.data_type),
      });
    });
  }

  // 处理指标字段作为响应数据
  if (interfaceData.metrics && Array.isArray(interfaceData.metrics)) {
    interfaceData.metrics.forEach((metric: MetricData, index: number) => {
      const fieldName = metric.name || `metric${index}`;
      const expression = isListType
        ? `response.data.items[].${fieldName}`
        : `response.data.${fieldName}`;

      fields.push({
        id: `resp-metric-${index}`,
        name: isListType ? `items[].${fieldName}` : fieldName,
        expression: expression,
        description: `${fieldName}指标`,
        required: metric.required || false,
        type: mapDataType(metric.data_type),
      });
    });
  }

  // 对于列表接口，添加分页信息
  if (isListType) {
    fields.push(
      {
        id: 'resp-total',
        name: 'total',
        expression: 'response.data.total',
        description: '总数量',
        required: true,
        type: 'number',
      },
      {
        id: 'resp-currentPage',
        name: 'currentPage',
        expression: 'response.data.currentPage',
        description: '当前页码',
        required: true,
        type: 'number',
      }
    );
  }

  return fields;
}

/**
 * 将后端工作流结果转换为文档段落
 */
export function transformISMToDocumentSections(ism: ISMData, rawDocs?: string[]): DocumentSection[] {
  const sections: DocumentSection[] = [];

  // 添加文档概述段落
  if (ism && ism.doc_meta) {
    sections.push({
      id: 'section-overview',
      title: ism.doc_meta.title || '文档概述',
      content: `文档标题：${ism.doc_meta.title || '未知文档'}\n文档来源：${ism.doc_meta.url || ''}\n\n本文档包含了系统的接口规范和功能需求。`,
      isAPI: false,
    });
  }

  // 添加原始文档内容段落（如果有的话）
  if (rawDocs && rawDocs.length > 0) {
    rawDocs.forEach((doc, index) => {
      if (doc && doc.trim()) {
        sections.push({
          id: `section-raw-${index}`,
          title: `原始文档内容 ${index + 1}`,
          content: doc,
          isAPI: false,
        });
      }
    });
  }

  // 为每个接口创建对应的文档段落
  if (ism && ism.interfaces && Array.isArray(ism.interfaces)) {
    ism.interfaces.forEach((interfaceData: InterfaceData, index: number) => {
      const { method, endpoint } = {
        method: determineHttpMethod(interfaceData),
        endpoint: generateEndpoint(interfaceData)
      };

      let content = `接口名称：${interfaceData.name || `接口${index + 1}`}\n`;
      content += `接口类型：${interfaceData.type || '未知'}\n`;
      content += `请求方法：${method}\n`;
      content += `请求路径：${endpoint}\n\n`;

      // 添加维度信息
      if (interfaceData.dimensions && interfaceData.dimensions.length > 0) {
        content += '维度参数：\n';
        interfaceData.dimensions.forEach((dimension: DimensionData) => {
          const required = dimension.required ? '（必填）' : '（选填）';
          content += `- ${dimension.name || '未知维度'}: ${dimension.data_type || 'string'}${required}\n`;
        });
        content += '\n';
      }

      // 添加指标信息
      if (interfaceData.metrics && interfaceData.metrics.length > 0) {
        content += '指标参数：\n';
        interfaceData.metrics.forEach((metric: MetricData) => {
          const required = metric.required ? '（必填）' : '（选填）';
          content += `- ${metric.name || '未知指标'}: ${metric.data_type || 'number'}${required}\n`;
        });
        content += '\n';
      }

      sections.push({
        id: `section-interface-${index + 1}`,
        title: interfaceData.name || `接口${index + 1}`,
        content: content,
        isAPI: true,
      });
    });
  }

  return sections;
}

/**
 * 映射数据类型
 */
function mapDataType(backendType: string): string {
  const typeMap: { [key: string]: string } = {
    'string': 'string',
    'number': 'number',
    'float64': 'number',
    'int': 'number',
    'boolean': 'boolean',
    'date': 'string',
    'array': 'array',
    'object': 'object',
  };

  return typeMap[backendType.toLowerCase()] || 'string';
}

/**
 * 转换为驼峰命名
 */
function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * 验证后端数据结构
 */
export function validateBackendData(data: any): data is BackendWorkflowResponse {
  return (
    data &&
    typeof data === 'object' &&
    data.ism &&
    data.ism.doc_meta &&
    Array.isArray(data.ism.interfaces)
  );
}