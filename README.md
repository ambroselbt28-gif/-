# 游戏属性计算器 - 酒馆同层集成应用

这是一个可以无缝集成到酒馆（SillyTavern）环境中的游戏属性计算器，支持"同层游玩"体验。

## 功能特性

- ✅ 游戏属性计算（HP、MP、攻击力、防御力等）
- ✅ 伤害计算系统
- ✅ 技能效果计算
- ✅ 数据持久化（LocalStorage）
- ✅ 与酒馆父窗口通信
- ✅ 响应式设计，适配各种屏幕
- ✅ 无缝集成体验

## 快速开始

### 1. 部署到 GitHub Pages

1. Fork 或克隆这个仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择分支（通常是 `main` 或 `master`）
4. 等待几分钟，你的应用将在 `https://你的用户名.github.io/仓库名/` 可用

### 2. 在酒馆中集成

在角色卡片的正则或描述中添加以下代码：

```html
<body>
  <script>
  $("body").load("https://你的用户名.github.io/仓库名/");
  </script>
</body>
```

或使用 iframe 方式：

```html
<body>
  <iframe
    src="https://你的用户名.github.io/仓库名/"
    style="width:100%; height:600px; border:none;"
    allow="scripts">
  </iframe>
</body>
```

## 文件结构

```
.
├── index.html              # 主应用程序
├── tavern-integration.html # 酒馆集成示例
├── README.md              # 说明文档
└── LICENSE                # 许可证
```

## API 通信

应用支持与父窗口通信，可以发送和接收数据：

### 从应用发送数据到酒馆
```javascript
window.parent.postMessage({
  type: 'gameData',
  action: 'updateStats',
  data: {
    hp: 100,
    mp: 50
  }
}, '*');
```

### 从酒馆接收数据
```javascript
window.addEventListener('message', function(event) {
  if (event.data.type === 'tavernCommand') {
    // 处理来自酒馆的命令
  }
});
```

## 自定义计算公式

你可以在 `index.html` 中修改计算公式，例如：

```javascript
// 伤害计算公式
const damage = attack * (1 - defense / (defense + 100)) * skillMultiplier;

// 暴击伤害
const critDamage = damage * (1 + critRate / 100) * critMultiplier;
```

## 本地开发

1. 克隆仓库
2. 使用任何 HTTP 服务器运行，例如：
   ```bash
   # 使用 Python
   python -m http.server 8000

   # 或使用 Node.js http-server
   npx http-server
   ```
3. 在浏览器中打开 `http://localhost:8000`

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 常见问题

### Q: 如何修改界面样式？
A: 编辑 `index.html` 中的 CSS 部分，调整颜色、字体、布局等。

### Q: 数据会保存吗？
A: 是的，数据会自动保存到浏览器的 LocalStorage 中。

### Q: 如何添加新的属性？
A: 在 `index.html` 中的 `gameState` 对象中添加新属性，然后在 UI 中添加对应的输入框。

### Q: 跨域问题怎么解决？
A: 使用 GitHub Pages 托管可以避免大部分跨域问题。确保你的页面通过 HTTPS 访问。
