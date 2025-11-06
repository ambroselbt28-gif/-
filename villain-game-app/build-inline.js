const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建单文件 HTML...');

// 读取所有文件
const htmlPath = path.join(__dirname, 'index.html');
const cssPath = path.join(__dirname, 'style.css');
const jsPath = path.join(__dirname, 'game.js');
const yamlPath = path.join(__dirname, '反派逆袭系统指南.yaml');

console.log('📖 读取文件...');
let html = fs.readFileSync(htmlPath, 'utf-8');
const css = fs.readFileSync(cssPath, 'utf-8');
const js = fs.readFileSync(jsPath, 'utf-8');

// 替换 CSS 链接为内联样式
html = html.replace(
    /<link rel="stylesheet" href="style\.css">/,
    `<style>${css}</style>`
);

// 替换 JS 引用为内联脚本
html = html.replace(
    /<script src="game\.js"><\/script>/,
    `<script>${js}</script>`
);

// 创建 dist 目录
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// 写入单文件 HTML
const outputPath = path.join(distDir, 'index.html');
fs.writeFileSync(outputPath, html, 'utf-8');
console.log('✅ 已生成:', outputPath);

// 复制 YAML 文件
const yamlOutputPath = path.join(distDir, '反派逆袭系统指南.yaml');
fs.copyFileSync(yamlPath, yamlOutputPath);
console.log('✅ 已复制:', yamlOutputPath);

// 显示文件大小
const htmlSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
const yamlSize = (fs.statSync(yamlOutputPath).size / 1024).toFixed(2);

console.log('\n📊 构建统计:');
console.log(`  - index.html: ${htmlSize} KB`);
console.log(`  - 反派逆袭系统指南.yaml: ${yamlSize} KB`);
console.log(`  - 总大小: ${(parseFloat(htmlSize) + parseFloat(yamlSize)).toFixed(2)} KB`);
console.log('\n🎉 构建完成！');
