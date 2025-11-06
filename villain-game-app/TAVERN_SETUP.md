# SillyTavern 同层游玩配置指南

本文档说明如何在 SillyTavern（酒馆）中通过"同层游玩"方式集成"反派逆袭系统指南"游戏应用。

## 什么是同层游玩？

同层游玩是指将独立的 Web 应用嵌入到 SillyTavern 界面中，实现：
- 游戏界面与聊天界面并存
- 游戏状态与 AI 对话实时同步
- 无需刷新页面即可更新数据

## 前置准备

1. ✅ 已部署应用到 GitHub Pages
2. ✅ 获取应用URL：`https://ambroselbt28-gif.github.io/-/index.html`
3. ✅ 已安装并运行 SillyTavern（版本 1.11.0+）
4. ✅ 确保浏览器允许 iframe 跨域通信

## 推荐配置：iframe 嵌入

### 标准尺寸（推荐）

在酒馆的**世界书**或**角色卡描述**中添加：

```html
<iframe
    id="villain-game-frame"
    src="https://ambroselbt28-gif.github.io/-/index.html"
    allow="clipboard-write"
    style="position: fixed; top: 20px; right: 20px; width: 1200px; height: 800px; border: 2px solid #f0e68c; border-radius: 15px; z-index: 9999; box-shadow: 0 8px 32px rgba(0,0,0,0.7);">
</iframe>
```

###尺寸选项

根据你的屏幕大小选择合适的尺寸：

| 尺寸配置 | 宽度 | 高度 | 适用场景 |
|----------|------|------|----------|
| **标准（推荐）** | `1200px` | `800px` | 1920x1080 及以上分辨率 |
| **紧凑** | `900px` | `700px` | 1366x768 分辨率 |
| **大屏** | `1400px` | `900px` | 2K/4K 显示器 |
| **接近全屏** | `95vw` | `95vh` | 需要最大化显示面积 |

**全屏模式示例**：
```html
<iframe
    src="https://ambroselbt28-gif.github.io/-/index.html"
    style="position: fixed; top: 2.5vh; left: 2.5vw; width: 95vw; height: 95vh; border: 2px solid #f0e68c; border-radius: 15px; z-index: 9999; box-shadow: 0 8px 32px rgba(0,0,0,0.7);">
</iframe>
```

## 高级配置：同层通信（已实现）

游戏已经实现了与 SillyTavern 的深度集成（AI 自动更新游戏状态）。

### 1. TavernHelper 通信机制

游戏代码中已实现了完整的 TavernHelper 集成：

```javascript
// 已在 game.js 中实现
async sendViaTavernHelper(prompt, userInput) {
    const generateConfig = {
        injects: [{
            role: 'user',
            content: prompt,
            position: 'in_chat',
            should_scan: true
        }],
        should_stream: false
    };

    const aiResponse = await TavernHelper.generate(generateConfig);
    await this.processAIResponse(aiResponse);
    await this.syncStateToMessages(aiResponse);
}
```

游戏会自动检测是否在 SillyTavern 环境中运行，并选择合适的通信方式。

### 2. AI 提示词配置

在角色卡的**系统提示词**或**作者注释**中添加：

```
你是"反派逆袭系统指南"游戏的AI主持人。

# 游戏状态更新规则
当玩家的行动导致游戏状态变化时，请在你的回复末尾使用以下格式：

{{state_update::变量名=新值}}

# 可更新的变量
- 玩家.反派值 - 数字，当玩家完成反派行为时增加
- 玩家.境界 - 字符串，如"筑基十一层"
- 世界.当前地点 - 字符串，当前所在位置
- 世界.时间 - 字符串，游戏内时间
- 玩家.当前拥有的物品 - 数组，物品列表
- 女性角色.角色名.好感度 - 数字（-100到100）
- 女性角色.角色名.身体状态 - 字符串，50字左右的描写
- 女性角色.角色名.心理状态 - 字符串，50字左右的内心想法

# 示例回应
"你成功拦截了龙战的机缘，夺得了《龙象镇狱功》古卷。周围的修士都对你的手段感到敬畏。

{{state_update::玩家.反派值=2500}}
{{state_update::世界.当前地点=藏经阁}}
{{state_update::玩家.当前拥有的物品=['龙象镇狱功古卷']}}
{{state_update::女性角色.秦岚.好感度=95}}
{{state_update::女性角色.秦岚.心理状态=看着父亲得到如此强大的功法，心中既为父亲高兴，又担心这会引来不必要的麻烦}}"
```

### 3. 正则替换（清理状态标记）

在SillyTavern的**扩展** > **正则替换**中添加：

**名称**: `清理游戏状态标记`

**查找正则**:
```regex
\{\{state_update::[^}]+\}\}
```

**替换为**: （留空，完全删除）

**选项**:
- ☑ 启用
- ☑ 仅输出
- ☐ 仅输入

## 当前实现状态

**✅ TavernHelper 通信机制已实现**，当前功能包括：
- ✅ 游戏界面可以正常显示在酒馆中
- ✅ 可以查看游戏状态、角色信息、物品等
- ✅ 在游戏中输入的消息会通过 TavernHelper API 发送到 AI 后台
- ✅ AI 的回复会自动解析并更新游戏状态
- ✅ 游戏状态会自动同步到 SillyTavern 消息数据层（同层游玩）

**运行模式检测**：
- 当在 SillyTavern iframe 中运行且检测到 TavernHelper API 时，自动使用 TavernHelper 通信
- 当独立运行时（直接访问网页），自动降级到模拟模式，提供基础的游戏体验

## 测试步骤

### 1. 基础显示测试

1. 将 iframe 代码粘贴到世界书条目的内容中
2. 激活该世界书条目
3. 刷新聊天页面
4. 确认游戏界面显示在右上角

### 2. 尺寸调整测试

根据你的屏幕，调整 `width` 和 `height` 值：
- 太小：增大数值（如 `1200px` → `1400px`）
- 太大：减小数值
- 位置调整：修改 `top`、`right` 的像素值

### 3. 功能测试

在游戏界面中：
1. 点击"角色"标签，查看女性角色列表
2. 点击角色卡片，查看详细信息
3. 观察开场白是否自动播放
4. 检查状态栏是否正确显示

## 故障排除

### 问题：窗口太小，看不清内容

**解决方案**：
```html
<!-- 调整 width 和 height -->
<iframe src="..." style="... width: 1400px; height: 900px; ...">
```

### 问题：iframe 不显示

**可能原因**：
1. GitHub Pages 未部署成功
2. URL 错误
3. 浏览器阻止了 iframe

**解决方案**：
1. 直接访问 `https://ambroselbt28-gif.github.io/-/index.html` 确认可以打开
2. 检查浏览器控制台（F12）是否有错误信息
3. 尝试在无痕模式下打开

### 问题：在游戏中输入消息，但 AI 没有收到

**已解决**：TavernHelper 通信机制已实现。

**如果仍然遇到此问题**：
1. 确认你的 SillyTavern 版本是 1.11.0 或更高
2. 检查浏览器控制台（F12）是否有错误信息
3. 确认 TavernHelper 扩展已正确安装并启用
4. 尝试刷新页面重新加载游戏

**降级模式**：
- 如果 TavernHelper API 不可用，游戏会自动降级到模拟模式
- 在模拟模式下，会显示 `【模拟模式】正在生成AI回复...` 提示
- 这是正常的独立运行行为

## 推荐工作流程

1. **启动游戏**：在酒馆中加载角色卡，游戏界面自动显示
2. **查看状态**：在游戏右侧面板查看当前状态
3. **进行对话**：直接在游戏内的输入框输入你的行动（或在酒馆聊天框输入也可以）
4. **观察回复**：AI 会根据你的行动生成回复并显示在游戏日志中
5. **自动更新**：游戏状态会根据 AI 回复中的 `{{state_update::}}` 标记自动更新

## 技术实现细节

### 已实现的功能

1. **✅ TavernHelper 集成**
   - 已添加 `TavernHelper.getChatMessages()` 调用用于状态同步
   - 已实现 `TavernHelper.generate()` 发送玩家输入到 AI
   - 已实现自动降级机制（无 TavernHelper 时使用模拟模式）

2. **✅ 状态同步**
   - 游戏状态自动保存到 SillyTavern 第0层消息的 `data` 字段
   - AI回复后自动同步状态到消息层
   - 实现了无刷新静默同步（`refresh: 'none'`）

3. **✅ 指令解析**
   - 支持解析 `{{state_update::path=value}}` 格式
   - 支持嵌套路径更新（如 `女性角色.墨诗语.好感度=95`）
   - 自动类型转换（数字、布尔值、JSON对象）
   - 包含错误处理和回退机制

### 未来可扩展功能

1. **从消息层恢复状态**
   - 在游戏初始化时从第0层消息读取上次的游戏状态
   - 实现跨会话的状态持久化

2. **高级状态管理**
   - 支持更复杂的状态更新操作（数组追加、对象合并）
   - 实现状态历史记录和回滚功能

3. **UI增强**
   - 添加状态同步指示器
   - 显示当前通信模式（TavernHelper / 模拟模式）

## 参考资源

- [归墟Plus 完整实现参考](梦星前端代码解析.txt)
- [SillyTavern 官方文档](https://docs.sillytavern.app/)
- [GitHub Pages 文档](https://docs.github.com/pages)

---

**当前版本**: 独立模式 v1.0
**更新日期**: 2025-01-06

如需帮助，请访问：https://github.com/ambroselbt28-gif/-/issues
