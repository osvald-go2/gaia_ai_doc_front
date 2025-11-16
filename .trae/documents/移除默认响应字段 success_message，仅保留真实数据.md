## 目标
- 响应字段只展示后端或推断出的真实数据，不再自动添加 `success` 与 `message` 两个默认字段。

## 改动范围
- `src/utils/dataTransform.ts`：删除在 `transformResponseFields` 中对 `success` 与 `message` 的默认注入。
- 其余组件无需改动：`InterfaceEditor.tsx` 会在无出参时显示空态，交互正常。

## 实现步骤
- 定位默认字段代码：`src/utils/dataTransform.ts:175-193`（添加基础响应字段的 push 逻辑）。
- 删除该默认注入，保留后续维度/指标映射与分页字段逻辑。
- 保持与后端 `ISM.interfaces[].fields` 的合并回填逻辑不变（已在 `mapBackendInterfaceFields` 完成）。

## 验证
- 解析文档后打开“接口配置”出参列表：不再出现 `success` 与 `message`；仅显示真实字段。
- 无真实出参时显示“暂无出参字段”的空态，交互正常。
- 主题样式、编辑操作与“查看来源”联动不受影响。