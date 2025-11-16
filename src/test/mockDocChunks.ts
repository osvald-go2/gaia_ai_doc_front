/**
 * 测试用文档块数据
 */

import { DocChunk, BackendWorkflowResponse } from '../types/backend';

export const mockDocChunks: DocChunk[] = [
  {
    chunk_id: 'chunk_0_a1b2c3d4',
    source_doc_index: 0,
    chunk_type: 'header_section',
    content: `# 电商管理系统产品设计

本文档描述了电商管理系统的整体架构和功能模块设计。系统包含用户管理、商品管理、订单管理、数据统计等核心模块。

## 系统概述

电商管理系统是一个综合性的B2C电商平台，旨在为企业和个人用户提供完整的在线交易解决方案。

## 技术架构

- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Node.js + Express + MongoDB
- **缓存**: Redis
- **消息队列**: RabbitMQ

## 核心特性

1. 用户管理：支持多种用户角色和权限控制
2. 商品管理：完整的商品生命周期管理
3. 订单管理：从下单到售后的全流程管理
4. 数据统计：实时数据分析和报表生成`,
    position: 0,
    line_start: 0,
    line_end: 4,
    prev_chunk_id: undefined,
    next_chunk_id: 'chunk_1_a1b2c3d5',
    context_before: undefined,
    context_after: '接下来将详细介绍各个功能模块的设计...',
    metadata: {
      word_count: 45,
      char_count: 120,
      line_count: 4,
      has_grid: false,
      has_code: false,
      importance_score: 0.9,
      processing_priority: 1
    }
  },
  {
    chunk_id: 'chunk_1_a1b2c3d5',
    source_doc_index: 0,
    chunk_type: 'paragraph',
    content: `## 用户管理模块

用户管理模块是系统的核心模块之一，负责处理用户的注册、登录、权限管理等功能。

### 主要功能

1. **用户注册与登录**
   - 手机号注册：支持短信验证码注册
   - 邮箱注册：支持邮件验证注册
   - 第三方登录：支持微信、QQ、支付宝等第三方登录

2. **用户信息管理**
   - 基本信息：昵称、头像、性别、生日等
   - 联系方式：手机、邮箱、地址等
   - 实名认证：支持身份证和银行卡认证

3. **权限控制**
   - 角色管理：管理员、商家、普通用户等角色
   - 权限细分：商品管理、订单管理、用户管理等权限
   - API访问控制：基于角色的API访问控制

### 数据字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | String | 是 | 用户唯一标识 |
| username | String | 是 | 用户登录名 |
| email | String | 是 | 用户邮箱地址 |
| phone | String | 是 | 手机号码 |
| status | Integer | 是 | 账户状态(0:禁用,1:正常) |
| createTime | Date | 是 | 账户创建时间 |

### API接口

\`\`\`javascript
// 用户注册
POST /api/v1/users/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "13800138000"
}
\`\`\``,
    position: 1,
    line_start: 5,
    line_end: 25,
    prev_chunk_id: 'chunk_0_a1b2c3d4',
    next_chunk_id: 'chunk_2_a1b2c3d6',
    context_before: '文档概述部分介绍了系统的整体架构...',
    context_after: '接下来将介绍商品管理模块...',
    metadata: {
      word_count: 125,
      char_count: 450,
      line_count: 20,
      has_grid: true,
      has_code: false,
      importance_score: 0.8,
      processing_priority: 2
    }
  },
  {
    chunk_id: 'chunk_2_a1b2c3d6',
    source_doc_index: 0,
    chunk_type: 'paragraph',
    content: `## 商品管理模块

商品管理模块负责电商平台中商品信息的维护和管理。

### 核心功能

1. **商品信息录入与编辑**
   - 商品基本信息设置
   - 商品图片上传
   - 商品描述编辑

2. **商品分类管理**
   - 分类树管理
   - 分类属性设置
   - 批量分类操作

3. **库存管理**
   - 实时库存监控
   - 库存预警设置
   - 批量库存调整

### 商品数据结构

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| productId | string | 是 | 商品唯一标识 |
| productName | string | 是 | 商品名称 |
| price | number | 是 | 商品价格 |
| stock | number | 是 | 库存数量 |
| category | string | 是 | 商品分类 |
| description | text | 否 | 商品描述 |`,
    position: 2,
    line_start: 26,
    line_end: 45,
    prev_chunk_id: 'chunk_1_a1b2c3d5',
    next_chunk_id: 'chunk_3_a1b2c3d7',
    context_before: '用户管理模块介绍了用户相关的功能...',
    context_after: '后面还有订单管理和数据统计模块...',
    metadata: {
      word_count: 98,
      char_count: 380,
      line_count: 19,
      has_grid: true,
      has_code: false,
      importance_score: 0.85,
      processing_priority: 2
    }
  },
  {
    chunk_id: 'chunk_3_a1b2c3d7',
    source_doc_index: 0,
    chunk_type: 'large_text_split',
    content: `## 订单管理模块

订单管理是电商系统的业务核心，涉及从下单到交付的完整流程。

### 主要功能

1. **订单创建与处理**
   - 购物车结算
   - 订单生成
   - 库存扣减

2. **订单状态跟踪**
   - 待付款、已付款、已发货、已完成等状态
   - 状态变更通知
   - 订单历史查询

3. **支付管理**
   - 多种支付方式支持
   - 支付状态同步
   - 退款处理

4. **物流管理**
   - 发货信息管理
   - 物流跟踪
   - 配送状态更新

### 关键数据字段

| 字段名 | 说明 |
|--------|------|
| orderId | 订单唯一标识 |
| userId | 下单用户ID |
| totalAmount | 订单总价 |
| status | 订单状态 |
| createTime | 订单创建时间 |

> 订单管理模块确保了整个交易流程的顺畅进行。`,
    position: 3,
    line_start: 46,
    line_end: 65,
    prev_chunk_id: 'chunk_2_a1b2c3d6',
    next_chunk_id: undefined,
    context_before: '商品管理模块描述了商品相关的功能...',
    context_after: undefined,
    metadata: {
      word_count: 110,
      char_count: 420,
      line_count: 19,
      has_grid: false,
      has_code: false,
      importance_score: 0.75,
      processing_priority: 3
    }
  }
];

export const mockBackendResponseWithChunks: BackendWorkflowResponse = {
  feishu_urls: ['https://example.feishu.cn/doc/test'],
  user_intent: 'generate_crud',
  trace_id: 'test-trace-12345',
  raw_docs: ['电商管理系统完整文档内容...'],
  doc_chunks: mockDocChunks,
  use_chunked_processing: true,
  chunk_metadata: {
    total_chunks: 4,
    total_documents: 1,
    chunking_strategy: {
      method: 'rule_based',
      max_chunk_size: 2000,
      min_chunk_size: 100,
      split_by_headers: true,
      split_by_paragraphs: true,
      preserve_context: true
    },
    processing_stats: {
      chunks_with_grid: 2,
      chunks_with_code: 0,
      average_chunk_size: 342.5,
      processing_time_ms: 1250
    }
  },
  ism: {
    doc_meta: {
      title: '电商管理系统产品设计',
      url: 'https://example.feishu.cn/doc/test',
      version: 'latest',
      parsing_mode: 'chunked_parallel',
      total_chunks: 4,
      chunks_with_grid: 2
    },
    interfaces: [
      {
        id: 'api_user_list',
        name: '用户管理模块',
        type: 'data_display',
        description: '用户信息的查询和管理',
        fields: [
          {
            name: '用户ID',
            expression: 'userId',
            data_type: 'string',
            required: true,
            description: '用户唯一标识'
          },
          {
            name: '用户名',
            expression: 'username',
            data_type: 'string',
            required: true,
            description: '用户登录名'
          },
          {
            name: '邮箱',
            expression: 'email',
            data_type: 'string',
            required: false,
            description: '用户邮箱地址'
          }
        ],
        operations: ['read', 'create', 'update', 'delete'],
        source_chunk_ids: ['chunk_1_a1b2c3d5']
      },
      {
        id: 'api_product_list',
        name: '商品管理模块',
        type: 'data_display',
        description: '商品信息的查询和管理',
        fields: [
          {
            name: '商品ID',
            expression: 'productId',
            data_type: 'string',
            required: true,
            description: '商品唯一标识'
          },
          {
            name: '商品名称',
            expression: 'productName',
            data_type: 'string',
            required: true,
            description: '商品名称'
          },
          {
            name: '价格',
            expression: 'price',
            data_type: 'number',
            required: true,
            description: '商品价格'
          },
          {
            name: '库存',
            expression: 'stock',
            data_type: 'number',
            required: true,
            description: '库存数量'
          }
        ],
        operations: ['read', 'create', 'update', 'delete'],
        source_chunk_ids: ['chunk_2_a1b2c3d6']
      }
    ],
    parsing_statistics: {
      total_chunks: 4,
      chunks_with_grid: 2,
      interfaces_generated: 2,
      entities_generated: 2,
      processing_time_ms: 1250
    },
    __processing_method: 'chunked_parallel',
    __version: '1.0'
  },
  diag: {
    fixups: [],
    warnings: ['部分字段缺少描述信息'],
    errors: []
  },
  plan: [
    {
      tool: 'create_interface',
      args: {
        graph_json: '{"nodes": [], "edges": []}',
        interface_id: 'api_user_list',
        interface_name: '用户管理模块'
      }
    }
  ],
  final_flow_json: '{"nodes": [], "edges": []}',
  mcp_payloads: [],
  response: {
    trace_id: 'test-trace-12345',
    status: 'success',
    ism: {
      doc_meta: {
        title: '电商管理系统产品设计',
        url: 'https://example.feishu.cn/doc/test'
      },
      interfaces: []
    },
    plan: []
  }
};