# 反派逆袭系统指南 - Web应用

这是一个基于浏览器的交互式文字游戏应用，支持与 SillyTavern（酒馆）集成进行同层游玩。

## 功能特性

- **动态状态管理**：实时跟踪玩家境界、反派值、物品、技能等游戏状态
- **AI驱动对话**：通过动态提示词生成，让AI精确响应游戏场景
- **自动状态更新**：AI回复中的状态标记会自动更新游戏状态
- **进度保存**：支持本地浏览器存储的游戏进度保存/加载
- **酒馆集成**：可作为外部应用嵌入 SillyTavern 使用

## 快速开始

### 独立使用

1. 直接在浏览器中打开 `index.html`
2. 确保 YAML 配置文件路径正确（默认为 `../反派逆袭系统指南.yaml`）
3. 开始游戏！

### 系统指令

在输入框中输入以下指令：
- `状态` 或 `status` - 查看当前游戏状态
- `帮助` 或 `help` - 显示帮助信息
- `保存` 或 `save` - 保存当前游戏进度
- `加载` 或 `load` - 加载已保存的游戏进度

其他输入将作为对话发送给AI进行处理。

## 与酒馆集成使用

### 部署到 GitHub Pages

1. 将整个 `反派逆袭系统指南-app` 文件夹推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 记录你的应用 URL，例如：`https://你的用户名.github.io/你的仓库名/反派逆袭系统指南-app/`

### 在酒馆中配置

#### 方法一：使用 HTML 内容注入（推荐）

在酒馆的人物卡中添加以下内容：

```html
<div id="game-container"></div>
<script>
$(document).ready(function() {
    $('#game-container').load('https://你的GitHub-Pages-URL/index.html');
});
</script>
```

#### 方法二：使用 iframe 嵌入

```html
<iframe
    src="https://你的GitHub-Pages-URL/index.html"
    style="width: 100%; height: 800px; border: none;"
    id="villain-game-frame">
</iframe>
```

### 配置正则替换规则

在酒馆的"世界书"或"高级设置"中添加正则替换规则，使AI能够进行状态更新：

**正则模式：**
```regex
\{\{state_update::(.+?)=(.+?)\}\}
```

**替换为：**
```
[状态已更新]
```

或者保持原样，让应用内的 JavaScript 自动处理。

## AI 交互机制

### 动态提示词生成

当玩家输入对话时，应用会根据当前游戏状态自动生成精确的提示词：

```javascript
# 当前游戏状态
- 玩家境界: 凡人
- 反派值: 0
- 当前地点: 天机阁
- 当前时间: 2025年1月1日 星期一 上午 08:00
- 物品: 无
- 技能: 无

# 场景描述
玩家在天机阁，说了: "我要查看当前任务"

请作为游戏旁白/系统，根据当前状态描述场景的变化或给出合适的反馈。

# 重要规则
请在你的回复末尾，使用以下格式标记任何状态变化：
{{state_update::变量名=新值}}
例如：{{state_update::玩家.反派值=15}}
```

### 状态更新语法

AI 可以在回复中使用以下格式来更新游戏状态：

```
{{state_update::玩家.反派值=10}}
{{state_update::世界.当前地点=修仙门派}}
{{state_update::玩家.当前拥有的物品=灵石;丹药;法宝}}
```

应用会自动：
1. 解析这些标记
2. 更新内部游戏状态
3. 刷新UI显示
4. 从显示的消息中移除标记

## 技术架构

### 文件结构

```
反派逆袭系统指南-app/
├── index.html          # 主HTML文件
├── game.js            # 游戏引擎和逻辑
├── style.css          # 样式文件
└── README.md          # 本文档
```

### 核心功能模块

1. **状态管理**（State Management）
   - 游戏状态对象 `game.state`
   - 自动初始化和验证
   - 本地存储持久化

2. **提示词生成**（Prompt Generation）
   - `generateDynamicPrompt()` - 根据游戏状态动态构建提示词
   - 上下文感知的指令生成
   - 角色特定的对话引导

3. **AI通信接口**（AI Communication）
   - `sendToTavern()` - 发送消息到酒馆
   - `handleTavernResponse()` - 处理AI回复
   - `processAIResponse()` - 解析和执行状态更新

4. **状态更新解析**（State Update Parser）
   - 正则表达式匹配 `{{state_update::...}}`
   - 类型智能转换（字符串、数字、布尔、JSON）
   - 嵌套对象路径支持

## 调试模式

应用默认包含模拟AI回复功能，方便独立测试：

1. 打开浏览器控制台
2. 输入对话
3. 查看生成的提示词（`console.log`）
4. 观察模拟AI回复和状态更新

## 开发和扩展

### 添加新的状态变量

在 `initializeGameState()` 中添加新字段：

```javascript
this.state = {
    // ... 现有字段
    新分类: {
        新变量: 初始值
    }
};
```

### 自定义提示词生成逻辑

修改 `generateDynamicPrompt()` 函数，添加特定场景的逻辑：

```javascript
if (world.当前地点 === '特殊地点') {
    instruction = '特殊场景的指令...';
}
```

### 扩展系统指令

在 `handleSystemCommand()` 中添加新指令：

```javascript
case '新指令':
    systemResponse = '执行结果';
    break;
```

## 常见问题

### Q: 配置文件加载失败？
A: 检查 YAML 文件路径是否正确，确保文件名和路径匹配。对于 GitHub Pages，可能需要调整为绝对路径。

### Q: 酒馆中无法通信？
A: 确保使用了正确的 iframe 或内容注入方式，并检查浏览器控制台的错误信息。

### Q: 状态更新不生效？
A: 检查状态更新语法是否正确，路径是否存在。查看控制台日志确认解析结果。

### Q: 如何重置游戏？
A: 刷新页面会重新初始化游戏。如果需要清除保存的进度，在控制台运行：
```javascript
localStorage.removeItem('villain_game_save');
```

## 许可和贡献

本项目为开源项目，欢迎提交 Issue 和 Pull Request。

## 联系方式

如有问题或建议，请通过 GitHub Issues 联系。
