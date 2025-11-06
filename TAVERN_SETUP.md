# SillyTavern 酒馆集成配置指南

本文档详细说明如何在 SillyTavern（酒馆）中配置"反派逆袭系统指南"游戏应用。

## 前置准备

1. 已部署应用到 GitHub Pages
2. 获取应用的公开URL（例如：`https://username.github.io/repo-name/反派逆袭系统指南-app/`）
3. 已安装并运行 SillyTavern

## 配置步骤

### 步骤1：创建角色卡片

在酒馆中创建一个新的角色卡片，或编辑现有卡片。

### 步骤2：嵌入游戏应用

在角色卡片的"描述"或自定义HTML区域添加以下代码：

#### 选项A：完整页面替换（推荐用于游戏主导模式）

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; padding: 0; overflow: hidden; }
        #game-frame {
            width: 100vw;
            height: 100vh;
            border: none;
        }
    </style>
</head>
<body>
    <iframe
        id="game-frame"
        src="https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO-NAME/反派逆袭系统指南-app/index.html"
        allow="clipboard-write">
    </iframe>
</body>
</html>
```

#### 选项B：嵌入式面板（推荐用于辅助模式）

```html
<div style="margin: 20px 0;">
    <h3 style="color: #f0e68c;">反派逆袭系统</h3>
    <iframe
        src="https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO-NAME/反派逆袭系统指南-app/index.html"
        style="width: 100%; height: 600px; border: 2px solid #444; border-radius: 10px;"
        allow="clipboard-write">
    </iframe>
</div>
```

### 步骤3：配置世界书（可选但推荐）

#### 3.1 创建世界书条目

在酒馆的"世界书"中创建一个新条目：

**名称：** `游戏系统规则`

**触发关键词：** `状态更新`, `游戏`, `系统`

**内容：**
```
# 游戏系统说明
当前正在运行"反派逆袭系统指南"游戏。你需要根据玩家的行动和游戏状态生成回应。

## 状态更新格式
当游戏状态需要改变时，请在你的回复末尾使用以下格式：
{{state_update::变量路径=新值}}

## 可更新的变量示例
- 玩家.反派值 (数字)
- 玩家.境界 (字符串)
- 世界.当前地点 (字符串)
- 世界.时间 (字符串)
- 玩家.当前拥有的物品 (分号分隔的字符串)
- 玩家.当前拥有的技能 (分号分隔的字符串)

## 示例回应
"你成功完成了这次任务，获得了100点反派值。周围的人都对你的手段感到敬畏。

{{state_update::玩家.反派值=100}}
{{state_update::世界.当前地点=修仙门派}}"
```

#### 3.2 配置正则替换（清理状态标记）

在"扩展" > "正则替换"中添加新规则：

**名称：** `清理状态更新标记`

**查找正则：**
```regex
\{\{state_update::[^}]+\}\}
```

**替换为：**
```
[状态已更新]
```

**或者完全删除（推荐）：**
```

```
（替换为空）

**选项：**
- ☑ 启用
- ☑ 仅输出
- ☐ 仅输入

## 步骤4：设置AI提示词

### 主提示词模板

在角色卡片的"系统提示词"或"作者注释"中添加：

```
你是"反派逆袭系统指南"游戏的AI主持人。你的职责是：

1. 根据当前游戏状态（玩家境界、反派值、地点、时间等）生成合适的场景描述和对话
2. 当玩家执行行动时，判断结果并更新游戏状态
3. 使用 {{state_update::变量名=新值}} 格式来标记状态变化
4. 保持故事的连贯性和逻辑性
5. 适当增加游戏的挑战性和趣味性

当前游戏状态将在每次对话时自动提供。请基于这些状态信息生成回应。
```

### 角色扮演提示

如果希望AI扮演特定角色（如天机老人），添加：

```
你正在扮演"天机老人"，反派主角的系统导师。性格特点：
- 神秘而睿智
- 对主角的反派行为表示赞赏
- 会提供策略建议，但不会直接干预
- 说话带有古风韵味

当玩家与你对话时，请保持这个角色设定。
```

## 步骤5：测试集成

### 测试清单

1. **加载测试**
   - 打开角色卡片
   - 确认游戏界面正常显示
   - 检查是否有CORS错误

2. **交互测试**
   - 在游戏中输入 `帮助`
   - 确认系统指令正常工作
   - 尝试输入对话，观察AI回应

3. **状态更新测试**
   - 让AI生成包含 `{{state_update::...}}` 的回复
   - 确认游戏界面中的状态数值已更新
   - 查看浏览器控制台确认没有错误

4. **保存/加载测试**
   - 输入 `保存` 保存游戏
   - 刷新页面
   - 输入 `加载` 恢复游戏
   - 确认状态正确恢复

## 高级配置

### 自定义AI行为

创建多个世界书条目，针对不同场景提供特定指导：

#### 战斗场景
**触发词：** `战斗`, `攻击`, `对决`

**内容：**
```
当前进入战斗场景。请：
1. 描述紧张的战斗氛围
2. 根据双方境界判断战斗结果
3. 战斗胜利应增加反派值：{{state_update::玩家.反派值=X}}
4. 可能获得战利品：{{state_update::玩家.当前拥有的物品=原有;新物品}}
```

#### 任务完成
**触发词：** `完成任务`, `任务成功`

**内容：**
```
任务完成场景。请：
1. 确认任务目标已达成
2. 发放任务奖励
3. 清空当前任务：{{state_update::当前任务.任务内容=无}}
4. 可能触发新的支线任务
```

### 跨窗口通信（高级）

如果需要实现更复杂的交互，可以在酒馆中添加自定义JavaScript：

```html
<script>
// 监听游戏应用发送的消息
window.addEventListener('message', function(event) {
    if (event.data.type === 'TAVERN_GAME_ACTION') {
        console.log('游戏动作:', event.data);

        // 这里可以添加自定义处理逻辑
        // 例如：自动将游戏状态同步到角色卡变量

        // 发送AI请求
        // (需要根据你的SillyTavern API来实现)
    }
});

// 向游戏应用发送AI回复
function sendAIResponse(response) {
    const gameFrame = document.getElementById('game-frame');
    if (gameFrame && gameFrame.contentWindow) {
        gameFrame.contentWindow.postMessage({
            type: 'TAVERN_AI_RESPONSE',
            response: response
        }, '*');
    }
}
</script>
```

## 故障排除

### 问题：游戏界面不显示

**可能原因：**
- GitHub Pages 未正确部署
- URL 路径错误
- CORS 策略阻止

**解决方案：**
1. 直接在浏览器访问游戏URL，确认可以打开
2. 检查URL中的用户名、仓库名是否正确
3. 确保仓库是公开的

### 问题：状态更新不生效

**可能原因：**
- 正则格式错误
- JavaScript 解析失败
- 变量路径不存在

**解决方案：**
1. 打开浏览器控制台（F12），查看错误信息
2. 确认 `{{state_update::变量名=值}}` 格式正确
3. 在游戏中输入 `状态` 查看可用变量

### 问题：AI不生成状态更新标记

**可能原因：**
- AI提示词不够明确
- 模型理解有误

**解决方案：**
1. 在系统提示词中强调状态更新的重要性
2. 提供更多具体示例
3. 在对话中明确提醒AI："请更新我的反派值"

### 问题：跨域通信失败

**可能原因：**
- iframe 安全策略
- postMessage 未正确配置

**解决方案：**
1. 确保 iframe 中设置了 `allow="clipboard-write"`
2. 检查 postMessage 的目标域设置
3. 在独立窗口测试，确认基本功能正常

## 最佳实践

1. **定期保存进度**：提醒玩家使用 `保存` 指令
2. **状态同步**：重要状态变化后，让玩家输入 `状态` 确认
3. **清晰的提示词**：给AI提供详细的游戏规则和状态更新指南
4. **测试环境**：先在独立浏览器标签页测试，确认无误后再嵌入酒馆
5. **版本管理**：在 GitHub 仓库使用 releases 管理不同版本

## 示例配置文件

完整的示例配置已包含在仓库的 `examples/` 文件夹中：
- `character_card.json` - 角色卡片示例
- `world_info.json` - 世界书配置示例
- `regex_scripts.json` - 正则替换规则示例

## 进一步资源

- [SillyTavern 官方文档](https://docs.sillytavern.app/)
- [GitHub Pages 部署指南](https://docs.github.com/pages)
- [正则表达式教程](https://regexr.com/)

---

**配置完成后，你就可以在酒馆中享受完整的"反派逆袭系统指南"游戏体验了！**
