import { useState } from 'react';
import { APIInterface } from './InterfaceList';
import { Button } from './ui/button';
import { Database, FileCode, Package, ChevronDown, ChevronUp, GripHorizontal, Copy, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ScrollBar } from './ui/scroll-area';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area@1.2.3';
import { Resizable } from 're-resizable';

interface WorkflowNode {
  id: string;
  type: 'input' | 'process' | 'output';
  label: string;
  x: number;
  y: number;
  sql?: string;
  description?: string;
}

interface WorkflowPreviewProps {
  interface: APIInterface;
}

// SQL语法高亮函数
function highlightSQL(sql: string): JSX.Element {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP',
    'TABLE', 'INDEX', 'VIEW', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AS',
    'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'LIKE', 'BETWEEN', 'IS', 'NULL', 'ORDER', 'BY',
    'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
    'BEGIN', 'END', 'IF', 'ELSE', 'WHILE', 'FOR', 'DECLARE', 'SET', 'TRANSACTION',
    'COMMIT', 'ROLLBACK', 'TRY', 'CATCH', 'THROW', 'RETURN', 'CASE', 'WHEN', 'THEN',
    'FOR', 'JSON', 'PATH', 'ROOT'
  ];

  const lines = sql.split('\n');
  
  return (
    <>
      {lines.map((line, lineIndex) => {
        const tokens: JSX.Element[] = [];
        let currentIndex = 0;
        
        // 处理注释
        const commentMatch = line.match(/^(\s*)(--.*)/);
        if (commentMatch) {
          const [, spaces, comment] = commentMatch;
          return (
            <div key={lineIndex}>
              <span className="sql-spaces">{spaces}</span>
              <span className="sql-comment">{comment}</span>
              {'\n'}
            </div>
          );
        }
        
        // 处理其他内容
        const regex = /(\b(?:SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|IN|EXISTS|LIKE|BETWEEN|IS|NULL|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|DISTINCT|COUNT|SUM|AVG|MAX|MIN|BEGIN|END|IF|ELSE|WHILE|FOR|DECLARE|SET|TRANSACTION|COMMIT|ROLLBACK|TRY|CATCH|THROW|RETURN|CASE|WHEN|THEN|FOR|JSON|PATH|ROOT)\b)|('(?:[^']|'')*')|(@\w+)|(\d+)|(\(|\)|\[|\]|,|;|=|\+|-|\*|\/|<|>)/gi;
        
        let match;
        let lastIndex = 0;
        
        while ((match = regex.exec(line)) !== null) {
          // 添加匹配之前的文本
          if (match.index > lastIndex) {
            tokens.push(
              <span key={`text-${lineIndex}-${lastIndex}`}>
                {line.substring(lastIndex, match.index)}
              </span>
            );
          }
          
          const matchedText = match[0];
          
          // 关键字
          if (match[1]) {
            tokens.push(
              <span key={`keyword-${lineIndex}-${match.index}`} className="sql-keyword">
                {matchedText}
              </span>
            );
          }
          // 字符串
          else if (match[2]) {
            tokens.push(
              <span key={`string-${lineIndex}-${match.index}`} className="sql-string">
                {matchedText}
              </span>
            );
          }
          // 变量
          else if (match[3]) {
            tokens.push(
              <span key={`variable-${lineIndex}-${match.index}`} className="sql-variable">
                {matchedText}
              </span>
            );
          }
          // 数字
          else if (match[4]) {
            tokens.push(
              <span key={`number-${lineIndex}-${match.index}`} className="sql-number">
                {matchedText}
              </span>
            );
          }
          // 操作符
          else if (match[5]) {
            tokens.push(
              <span key={`operator-${lineIndex}-${match.index}`} className="sql-operator">
                {matchedText}
              </span>
            );
          }
          
          lastIndex = match.index + matchedText.length;
        }
        
        // 添加剩余的文本
        if (lastIndex < line.length) {
          tokens.push(
            <span key={`text-${lineIndex}-${lastIndex}`}>
              {line.substring(lastIndex)}
            </span>
          );
        }
        
        return (
          <div key={lineIndex}>
            {tokens.length > 0 ? tokens : <span>{line}</span>}
            {'\n'}
          </div>
        );
      })}
    </>
  );
}

export function WorkflowPreview({ interface: apiInterface }: WorkflowPreviewProps) {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showSQLPanel, setShowSQLPanel] = useState(false);
  const [sqlPanelHeight, setSqlPanelHeight] = useState(300); // 默认半屏高度
  const [isResizing, setIsResizing] = useState(false); // 拖拽状态
  const [copied, setCopied] = useState(false); // 复制状态

  // 根据接口生成工作流节点 - 从右到左排列，起始节点在最右侧
  const generateNodes = (): WorkflowNode[] => {
    const nodes: WorkflowNode[] = [];
    const requestFields = apiInterface.requestFields || [];
    const responseFields = apiInterface.responseFields || [];

    // 结束节点（最左侧）
    nodes.push({
      id: 'end',
      type: 'output',
      label: '输出',
      x: 20,
      y: 50,
      description: '接口响应输出'
    });

    // 出参数据节点
    if (responseFields.length > 0) {
      nodes.push({
        id: 'response-data',
        type: 'output',
        label: `出参数据\n${responseFields.length}个字段`,
        x: 180,
        y: 50,
        sql: generateResponseSQL(responseFields),
        description: '返回数据格式化'
      });
    }

    // 数据处理节点
    nodes.push({
      id: 'process',
      type: 'process',
      label: apiInterface.name,
      x: responseFields.length > 0 ? 340 : 180,
      y: 50,
      sql: generateProcessSQL(apiInterface),
      description: '业务逻辑处理'
    });

    // 入参数据节点
    if (requestFields.length > 0) {
      nodes.push({
        id: 'request-data',
        type: 'input',
        label: `入参数据\n${requestFields.length}个字段`,
        x: responseFields.length > 0 ? 500 : 340,
        y: 50,
        sql: generateRequestSQL(requestFields),
        description: '请求参数验证与处理'
      });
    }

    // 起始节点（最右侧）
    nodes.push({
      id: 'start',
      type: 'input',
      label: '起始',
      x: (requestFields.length > 0 ? 660 : (responseFields.length > 0 ? 500 : 340)),
      y: 50,
      description: '接口调用入口'
    });

    return nodes;
  };

  const generateRequestSQL = (fields: any[]) => {
    const fieldValidations = fields.map(f => 
      `    ${f.name} ${f.type}${f.required ? ' NOT NULL' : ''}`
    ).join(',\n');
    
    return `-- 入参验证
DECLARE @request_params TABLE (
${fieldValidations}
);

-- 参数验证逻辑
${fields.filter(f => f.required).map(f => 
  `IF @${f.name} IS NULL
    THROW 50001, '${f.name} 不能为空', 1;`
).join('\n')}`;
  };

  const generateProcessSQL = (apiInterface: APIInterface) => {
    return `-- ${apiInterface.name} 业务处理
-- 接口端点: ${apiInterface.endpoint}
-- 方法: ${apiInterface.method}

BEGIN TRY
    BEGIN TRANSACTION;
    
    -- 主业务逻辑
    SELECT 
        ${(apiInterface.responseFields || []).slice(0, 5).map((f, i) => 
          `${f.name} = @${f.expression || 'value_' + i}`
        ).join(',\n        ')}${(apiInterface.responseFields || []).length > 5 ? ',\n        ...' : ''}
    FROM business_table
    WHERE conditions_here;
    
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    THROW;
END CATCH;`;
  };

  const generateResponseSQL = (fields: any[]) => {
    return `-- 出参数据组装
SELECT 
${fields.slice(0, 10).map(f => 
  `    ${f.name} = ${f.expression || 'NULL'}`
).join(',\n')}${fields.length > 10 ? ',\n    ...' : ''}
FOR JSON PATH, ROOT('data');`;
  };

  const nodes = generateNodes();

  // 生成连接线 - 从右到左（从数组末尾的start节点开始连接）
  const connections = [];
  for (let i = nodes.length - 1; i > 0; i--) {
    connections.push({
      from: nodes[i],     // 右侧节点（x坐标大）
      to: nodes[i - 1]    // 左侧节点（x坐标小）
    });
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'input':
        return 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/10 border-blue-300 dark:border-blue-700/50';
      case 'process':
        return 'bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border-primary/30 dark:border-primary/40';
      case 'output':
        return 'bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/10 border-green-300 dark:border-green-700/50';
      default:
        return 'bg-gradient-to-br from-secondary/20 to-secondary/10 dark:from-secondary/10 dark:to-secondary/5 border-border';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'input':
        return <Database className="w-4 h-4" />;
      case 'process':
        return <Package className="w-4 h-4" />;
      case 'output':
        return <FileCode className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-[#f5f5f5] dark:bg-[#1a1a1a]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        <ScrollAreaPrimitive.Root className="relative w-full h-full">
          <ScrollAreaPrimitive.Viewport className="w-full h-full">
            <div className="relative w-full h-full p-6 flex items-start justify-center">
              <div className="relative" style={{ width: '720px', height: '200px' }}>
              {/* SVG for connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 5, 0 10" fill="#000000" className="dark:fill-white" />
                  </marker>
                </defs>
                {connections.map((conn, i) => {
                  // 箭头方向从左到右，连接左侧节点的右边缘到右侧节点的左边缘
                  const startX = conn.to.x + 120;  // 左侧节点的右边缘
                  const startY = conn.to.y + 35;
                  const endX = conn.from.x;  // 右侧节点的左边缘
                  const endY = conn.from.y + 35;
                  const midX = (startX + endX) / 2;
                  
                  return (
                    <g key={i}>
                      <path
                        d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                        stroke="#000000"
                        className="dark:stroke-white"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.3"
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Nodes */}
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute"
                  style={{ left: node.x, top: node.y, zIndex: 10 }}
                >
                  <button
                    onClick={() => {
                      if (node.sql) {
                        setSelectedNode(node);
                        setShowSQLPanel(true);
                      }
                    }}
                    className={`
                      w-[120px] h-[70px] rounded-lg border-2 
                      ${getNodeColor(node.type)}
                      ${node.sql ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : 'cursor-default'}
                      transition-all duration-200 p-2.5 flex flex-col items-center justify-center gap-1.5
                      relative group shadow-sm
                    `}
                  >
                    <div className={`${node.type === 'input' ? 'text-blue-600 dark:text-blue-400' : node.type === 'process' ? 'text-primary' : node.type === 'output' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                      {getNodeIcon(node.type)}
                    </div>
                    <div className="text-xs text-center whitespace-pre-line text-foreground leading-tight">
                      {node.label}
                    </div>
                    {node.sql && (
                      <div className="absolute top-1.5 right-1.5">
                        <FileCode className="w-3 h-3 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </button>
                </div>
              ))}
              </div>
            </div>
          </ScrollAreaPrimitive.Viewport>
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
        </ScrollAreaPrimitive.Root>
      </div>

      {/* SQL Detail Panel */}
      {showSQLPanel && selectedNode && (
        <Resizable
          size={{ width: '100%', height: sqlPanelHeight }}
          onResize={() => {
            if (!isResizing) {
              setIsResizing(true);
            }
          }}
          onResizeStop={(e, direction, ref, d) => {
            setSqlPanelHeight(sqlPanelHeight + d.height);
            setIsResizing(false);
          }}
          minHeight={150}
          maxHeight={600}
          enable={{
            top: true,
            right: false,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false
          }}
          handleComponent={{
            top: (
              <div className={`absolute top-0 left-0 right-0 h-2 flex items-center justify-center cursor-ns-resize group hover:bg-primary/10 ${!isResizing ? 'transition-colors' : ''}`}>
                <div className={`w-12 h-1 rounded-full bg-border group-hover:bg-primary ${!isResizing ? 'transition-colors' : ''}`} />
              </div>
            )
          }}
          className="border-t border-border bg-background fixed bottom-0 left-0 right-0 shadow-lg z-50"
          style={{
            willChange: isResizing ? 'height' : 'auto',
          }}
        >
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between mt-2 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-foreground">{selectedNode.label} - SQL查询</span>
              {selectedNode.description && (
                <span className="text-[10px] text-muted-foreground">({selectedNode.description})</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => {
                  if (selectedNode.sql) {
                    navigator.clipboard.writeText(selectedNode.sql).then(() => {
                      setCopied(true);
                      toast.success('SQL已复制到剪贴板');
                      setTimeout(() => setCopied(false), 2000);
                    }).catch(() => {
                      toast.error('复制失败');
                    });
                  }
                }}
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2 hover:bg-primary/10"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    复制
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowSQLPanel(false)}
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2"
              >
                <ChevronDown className="w-3.5 h-3.5 mr-1" />
                收起
              </Button>
            </div>
          </div>
          
          <ScrollAreaPrimitive.Root style={{ height: `calc(100% - 38px)` }}>
            <ScrollAreaPrimitive.Viewport className="w-full h-full">
              <div className="p-4">
                <pre className="sql-editor text-xs font-mono border border-border rounded-lg p-4 overflow-x-auto leading-relaxed">
                  {highlightSQL(selectedNode.sql || '')}
                </pre>
              </div>
            </ScrollAreaPrimitive.Viewport>
            <ScrollBar orientation="vertical" />
          </ScrollAreaPrimitive.Root>
        </Resizable>
      )}

      {!showSQLPanel && (
        <div className="px-4 py-2.5 border-t border-border bg-background/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground text-center">
            点击带有 <FileCode className="w-3 h-3 inline" /> 图标的节点查看SQL代码
          </p>
        </div>
      )}
    </div>
  );
}
