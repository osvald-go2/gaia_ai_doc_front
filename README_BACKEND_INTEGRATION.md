# AI文档生成器 - 后端集成版本

## 概述

这是原AI文档生成器前端与LangGraph后端的集成版本。前端现在可以调用后端的AI工作流来处理真实的飞书文档，并生成接口配置。

## 架构

### 前端 (ai-doc-front)
- **技术栈**: React + TypeScript + Vite + Tailwind CSS
- **端口**: 6789
- **功能**: 提供用户界面，调用后端API，展示生成的接口配置

### 后端 (ai-agent-backend)
- **技术栈**: Python + FastAPI + LangGraph
- **端口**: 8123
- **功能**: AI文档解析，ISM生成，工作流处理

## 新增功能

### 1. API服务层 (`src/services/api.ts`)
- 封装了对后端LangGraph API的调用
- 支持创建thread、运行工作流、获取结果
- 提供便捷的文档解析方法

### 2. 数据转换工具 (`src/utils/dataTransform.ts`)
- 将后端返回的ISM数据转换为前端接口格式
- 智能推断HTTP方法和路径
- 生成请求和响应字段配置
- 创建对应的文档段落

### 3. 增强的加载组件 (`src/components/LoadingProcessEnhanced.tsx`)
- 显示详细的处理步骤
- 实时进度反馈
- 错误状态展示
- 支持URL显示

## 启动方式

### 方式1: 使用启动脚本 (推荐)
```bash
# 在项目根目录运行
start-dev.bat
```

### 方式2: 手动启动
```bash
# 启动后端
cd ai-agent-backend
uv run python server.py

# 启动前端 (新终端)
cd ai-doc-front
npm install
npm run dev
```

## 访问地址

- **前端界面**: http://localhost:6789
- **后端API**: http://localhost:8123
- **API文档**: http://localhost:8123/docs

## 工作流程

1. **用户输入URL**: 用户在前端输入飞书文档URL
2. **调用后端API**: 前端调用后端的文档解析接口
3. **LangGraph处理**: 后端使用AI工作流处理文档
4. **返回ISM数据**: 后端返回结构化的接口语义模型
5. **数据转换**: 前端将ISM数据转换为接口配置
6. **界面展示**: 用户可以编辑和配置生成的接口

## API接口说明

### 创建Thread
```http
POST /threads
```

### 运行工作流
```http
POST /threads/{thread_id}/runs/wait
Content-Type: application/json

{
  "assistant_id": "default",
  "input": {
    "feishu_url": "https://feishu.cn/doc/xxx",
    "user_intent": "generate_crud",
    "trace_id": "frontend-xxx"
  }
}
```

### 响应格式
```json
{
  "status": "completed",
  "result": {
    "response": {...},
    "ism": {
      "doc_meta": {...},
      "interfaces": [...]
    },
    "plan": [...],
    "final_flow_json": "..."
  },
  "thread_id": "xxx"
}
```

## 数据转换逻辑

### ISM到接口配置的转换
- **接口类型分析**: 根据接口名称和类型推断HTTP方法
- **路径生成**: 自动生成RESTful API路径
- **字段映射**: 将维度和指标转换为请求/响应字段
- **类型推断**: 智能推断字段类型和是否必填

### 文档段落生成
- **概述段落**: 基于文档元数据生成概述
- **接口段落**: 为每个接口生成对应的文档说明
- **参数说明**: 包含维度和指标的详细说明

## 错误处理

1. **网络错误**: 自动重试机制
2. **API错误**: 显示详细错误信息
3. **降级处理**: 失败时自动切换到Mock数据
4. **用户提示**: Toast通知用户处理状态

## 开发说明

### 前端开发
```bash
cd ai-doc-front
npm install
npm run dev
```

### 后端开发
```bash
cd ai-agent-backend
uv sync
uv run python server.py
```

### 调试模式
- 前端: 浏览器开发者工具
- 后端: Python日志 + FastAPI文档

## 配置说明

### 前端配置
- API地址: `src/services/api.ts` 中的 `API_BASE_URL`
- 超时设置: 可在API服务层配置

### 后端配置
- 端口: `server.py` 中的端口设置
- CORS: 已配置允许所有来源（开发环境）

## 注意事项

1. **端口冲突**: 确保8123和3000端口未被占用
2. **网络连接**: 前端需要能够访问后端API
3. **Mock数据**: 当后端不可用时，会自动使用Mock数据
4. **数据格式**: ISM数据格式的变更可能需要更新转换逻辑

## 扩展功能

### 未来可添加的功能
- 实时进度更新 (WebSocket)
- 批量文档处理
- 接口测试功能
- 导出功能 (JSON/YAML/Markdown)
- 历史记录持久化
- 用户配置管理

### 后端扩展点
- 更多文档类型支持
- 自定义AI模型
- 工作流可视化
- 性能监控