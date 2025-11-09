import { APIInterface } from './InterfaceList';

interface DocumentSection {
  id: string;
  title: string;
  content: string;
  isAPI: boolean;
}

export interface GeneratedDoc {
  title: string;
  generated: string;
  interfaces: APIInterface[];
  sections: DocumentSection[];
}

export function generateMarkdown(interfaces: APIInterface[], sections: DocumentSection[]): string {
  const timestamp = new Date().toLocaleString('zh-CN');
  
  let markdown = `# API接口文档\n\n`;
  markdown += `> 生成时间：${timestamp}\n`;
  markdown += `> 接口数量：${interfaces.length}\n\n`;
  
  markdown += `## 目录\n\n`;
  interfaces.forEach((api, index) => {
    markdown += `${index + 1}. [${api.name}](#${index + 1}-${api.name.replace(/\s+/g, '-')})\n`;
  });
  markdown += `\n---\n\n`;
  
  interfaces.forEach((api, index) => {
    markdown += `## ${index + 1}. ${api.name}\n\n`;
    
    // 入参
    const requestFields = api.requestFields || api.fields || [];
    if (requestFields.length > 0) {
      markdown += `### 请求参数（入参）\n\n`;
      markdown += `| 参数名 | 类型 | 必填 | 说明 |\n`;
      markdown += `|--------|------|------|------|\n`;
      
      requestFields.forEach(field => {
        const required = field.required ? '✓' : '✗';
        markdown += `| ${field.name} | ${field.type} | ${required} | ${field.expression} |\n`;
      });
      markdown += `\n`;
    }
    
    // 出参
    const responseFields = api.responseFields || [];
    if (responseFields.length > 0) {
      markdown += `### 响应参数（出参）\n\n`;
      markdown += `| 参数名 | 类型 | 必填 | 表达式 | 描述 |\n`;
      markdown += `|--------|------|------|--------|------|\n`;
      
      responseFields.forEach(field => {
        const required = field.required ? '✓' : '✗';
        const description = field.description || '-';
        markdown += `| ${field.name} | ${field.type} | ${required} | ${field.expression} | ${description} |\n`;
      });
      markdown += `\n`;
    }
    
    // 分隔线
    if (index < interfaces.length - 1) {
      markdown += `---\n\n`;
    }
  });
  
  return markdown;
}

export function generateJSON(interfaces: APIInterface[]): string {
  const doc = {
    title: 'API接口文档',
    generated: new Date().toISOString(),
    version: '1.0.0',
    interfaces: interfaces.map(api => ({
      name: api.name,
      method: api.method,
      endpoint: api.endpoint,
      requestParameters: (api.requestFields || api.fields || []).map(f => ({
        name: f.name,
        type: f.type,
        required: f.required,
        description: f.expression,
      })),
      responseParameters: (api.responseFields || []).map(f => ({
        name: f.name,
        type: f.type,
        required: f.required,
        expression: f.expression,
        description: f.description,
      })),
    })),
  };
  
  return JSON.stringify(doc, null, 2);
}

export function generateHTML(interfaces: APIInterface[], sections: DocumentSection[], theme: 'dark' | 'claude' = 'dark'): string {
  const timestamp = new Date().toLocaleString('zh-CN');
  
  // Theme-specific colors
  const colors = theme === 'claude' ? {
    primary: '#ea580c',
    background: '#fafaf9',
    cardBg: '#ffffff',
    border: '#e7e5e4',
    text: '#292524',
    textMuted: '#78716c',
    headerBg: 'linear-gradient(135deg, #ffffff 0%, #f5f5f4 100%)',
    sectionBg: '#fafaf9',
    codeBg: '#f5f5f4',
    tableHeaderBg: '#f5f5f4',
  } : {
    primary: '#00ff88',
    background: '#0a0a0a',
    cardBg: '#1a1a1a',
    border: '#2a2a2a',
    text: '#e5e7eb',
    textMuted: '#9ca3af',
    headerBg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
    sectionBg: '#0a0a0a',
    codeBg: '#1a1a1a',
    tableHeaderBg: '#1a1a1a',
  };
  
  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API接口文档</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: ${colors.text};
      background: ${colors.background};
      padding: 40px 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: ${colors.cardBg};
      border: 1px solid ${colors.border};
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: ${colors.headerBg};
      padding: 40px;
      border-bottom: 2px solid ${colors.primary};
    }
    h1 {
      font-size: 32px;
      color: ${colors.primary};
      margin-bottom: 12px;
    }
    .meta {
      color: ${colors.textMuted};
      font-size: 14px;
    }
    .content {
      padding: 40px;
    }
    .api-section {
      background: ${colors.sectionBg};
      border: 1px solid ${colors.border};
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .api-section:last-child {
      margin-bottom: 0;
    }
    .api-title {
      font-size: 24px;
      color: ${colors.text};
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid ${colors.border};
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .info-table th,
    .info-table td {
      padding: 12px;
      text-align: left;
      border: 1px solid ${colors.border};
    }
    .info-table th {
      background: ${colors.tableHeaderBg};
      color: ${colors.primary};
      font-weight: 600;
    }
    .info-table td {
      background: ${colors.sectionBg};
    }
    .method-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .method-get { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); }
    .method-post { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
    .method-put { background: rgba(234, 179, 8, 0.1); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.3); }
    .method-delete { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    code {
      background: ${colors.codeBg};
      padding: 2px 6px;
      border-radius: 4px;
      font-family: "Monaco", "Menlo", monospace;
      font-size: 13px;
      color: ${colors.primary};
    }
    pre {
      background: ${colors.sectionBg};
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      border: 1px solid #2a2a2a;
    }
    pre code {
      background: transparent;
      padding: 0;
      color: #e5e7eb;
    }
    .section-title {
      font-size: 18px;
      color: #fff;
      margin: 24px 0 12px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>API接口文档</h1>
      <div class="meta">
        生成时间：${timestamp} | 接口数量：${interfaces.length}
      </div>
    </div>
    <div class="content">
`;

  interfaces.forEach((api, index) => {
    const methodClass = `method-${api.method.toLowerCase()}`;
    const requestFields = api.requestFields || api.fields || [];
    const responseFields = api.responseFields || [];
    
    html += `
      <div class="api-section">
        <h2 class="api-title">${index + 1}. ${api.name}</h2>
        
        <div class="section-title">基本信息</div>
        <table class="info-table">
          <tr>
            <th width="30%">项目</th>
            <th>值</th>
          </tr>
          <tr>
            <td>接口名称</td>
            <td>${api.name}</td>
          </tr>
          <tr>
            <td>请求方法</td>
            <td><span class="method-badge ${methodClass}">${api.method}</span></td>
          </tr>
          <tr>
            <td>接口路径</td>
            <td><code>${api.endpoint}</code></td>
          </tr>
        </table>
`;

    if (requestFields.length > 0) {
      html += `
        <div class="section-title">请求参数（入参）</div>
        <table class="info-table">
          <tr>
            <th width="25%">参数名</th>
            <th width="15%">类型</th>
            <th width="10%">必填</th>
            <th>说明</th>
          </tr>
`;
      
      requestFields.forEach(field => {
        const required = field.required ? '✓' : '✗';
        html += `
          <tr>
            <td><code>${field.name}</code></td>
            <td><code>${field.type}</code></td>
            <td>${required}</td>
            <td>${field.expression}</td>
          </tr>
`;
      });
      
      html += `
        </table>
`;
    }

    if (responseFields.length > 0) {
      html += `
        <div class="section-title">响应参数（出参）</div>
        <table class="info-table">
          <tr>
            <th width="20%">参数名</th>
            <th width="12%">类型</th>
            <th width="8%">必填</th>
            <th width="30%">表达式</th>
            <th>描述</th>
          </tr>
`;
      
      responseFields.forEach(field => {
        const required = field.required ? '✓' : '✗';
        const description = field.description || '-';
        html += `
          <tr>
            <td><code>${field.name}</code></td>
            <td><code>${field.type}</code></td>
            <td>${required}</td>
            <td>${field.expression}</td>
            <td>${description}</td>
          </tr>
`;
      });
      
      html += `
        </table>
`;
    }

    html += `
      </div>
`;
  });

  html += `
    </div>
  </div>
</body>
</html>`;

  return html;
}
