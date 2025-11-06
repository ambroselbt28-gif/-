# 反派逆袭系统指南 - Web应用

这是一个基于浏览器的交互式文字游戏应用，支持与 SillyTavern（酒馆）集成进行同层游玩。

## 功能特性

- **动态状态管理**：实时跟踪玩家境界、反派值、物品、技能等游戏状态
- **AI驱动对话**：通过动态提示词生成，让AI精确响应游戏场景
- **自动状态更新**：AI回复中的状态标记会自动更新游戏状态
- **进度保存**：支持本地浏览器存储的游戏进度保存/加载
- **酒馆集成**：可作为外部应用嵌入 SillyTavern 使用

## 快速开始

### 方式一：本地安装到 SillyTavern（推荐）

**适用于**: 需要与 AI 实时交互的完整游戏体验

1. 运行 `准备安装包.bat` 生成安装包
2. 将生成的 `villain-game-install` 文件夹复制到 SillyTavern 的 `public` 目录
3. 重命名为 `villain-game`
4. 按照 `本地安装指南.md` 配置 iframe 和 AI 提示词
5. 开始游戏！

**优势**:
- ✅ 无跨域限制,直接访问 TavernHelper API
- ✅ 与 AI 实时交互
- ✅ 游戏状态自动同步
- ✅ 完全离线运行

### 方式二：独立浏览器模式

**适用于**: 仅查看游戏界面和基础功能测试

1. 直接在浏览器中打开 `index.html`
2. 游戏会自动运行在模拟模式
3. 可以查看界面和测试基础功能（无AI交互）

### 系统指令

在输入框中输入以下指令：
- `状态` 或 `status` - 查看当前游戏状态
- `帮助` 或 `help` - 显示帮助信息
- `保存` 或 `save` - 保存当前游戏进度
- `加载` 或 `load` - 加载已保存的游戏进度

其他输入将作为对话发送给AI进行处理。

## 与酒馆集成使用

### 推荐方式：本地安装（无跨域限制）

**为什么推荐本地安装？**

由于浏览器的跨域安全限制(CORS),从 GitHub Pages 加载的 iframe 无法访问 SillyTavern 的 TavernHelper API。本地安装可以完全避免这个问题。

**安装步骤**：

1. 运行 `准备安装包.bat` 生成安装包
2. 将 `villain-game-install` 文件夹复制到 `SillyTavern/public/` 目录下
3. 重命名为 `villain-game`
4. 在世界书或角色卡中添加 iframe:

```html
<iframe
    id="villain-game-frame"
    src="/villain-game/index.html"
    allow="clipboard-write"
    style="position: fixed; top: 20px; right: 20px; width: 1200px; height: 800px; border: 2px solid #f0e68c; border-radius: 15px; z-index: 9999; box-shadow: 0 8px 32px rgba(0,0,0,0.7);">
</iframe>
```

### 备用方式：GitHub Pages（仅展示用途）

**注意**: 此方式受跨域限制影响,无法与 AI 实时交互,仅适合展示游戏界面。

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 在酒馆中使用 iframe 嵌入:

```html
<iframe
    src="https://你的用户名.github.io/你的仓库名/index.html"
    style="position: fixed; top: 20px; right: 20px; width: 1200px; height: 800px; border: 2px solid #f0e68c; border-radius: 15px; z-index: 9999;">
</iframe>
```

**限制**: 游戏会自动降级到模拟模式,无法访问 TavernHelper API。

### 配置 AI 提示词

在角色卡的**系统提示词**或**作者注释**中添加:

```
你是"反派逆袭系统指南"游戏的AI主持人。

# 游戏状态更新规则
当玩家的行动导致游戏状态变化时,请在你的回复末尾使用以下格式:

{{state_update::变量名=新值}}

# 可更新的变量
- 玩家.反派值 - 数字
- 玩家.境界 - 字符串
- 女性角色.角色名.好感度 - 数字(-100到100)
- 女性角色.角色名.身体状态 - 字符串
- 女性角色.角色名.心理状态 - 字符串
```

### 配置正则替换（可选）

在 SillyTavern 的**扩展** > **正则替换**中添加:

**查找正则**: `\{\{state_update::[^}]+\}\}`
**替换为**: (留空)
**选项**: 启用,仅输出

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
