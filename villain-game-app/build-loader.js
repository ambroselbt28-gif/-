const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建加载器版本...');

// 创建 dist 目录
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// 复制文件
const files = [
    { src: 'index-loader.html', dest: 'index.html' },
    { src: 'style.css', dest: 'style.css' },
    { src: 'game.js', dest: 'game.js' },
    { src: '反派逆袭系统指南.yaml', dest: '反派逆袭系统指南.yaml' }
];

console.log('📋 复制文件...');

files.forEach(file => {
    const srcPath = path.join(__dirname, file.src);
    const destPath = path.join(distDir, file.dest);

    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        const size = (fs.statSync(destPath).size / 1024).toFixed(2);
        console.log(`  ✅ ${file.src} -> ${file.dest} (${size} KB)`);
    } else {
        console.warn(`  ⚠️  ${file.src} 不存在，跳过`);
    }
});

// 显示统计信息
console.log('\n📊 构建统计:');

const totalSize = files.reduce((sum, file) => {
    const destPath = path.join(distDir, file.dest);
    if (fs.existsSync(destPath)) {
        return sum + fs.statSync(destPath).size;
    }
    return sum;
}, 0);

console.log(`  - 总大小: ${(totalSize / 1024).toFixed(2)} KB`);
console.log(`  - 文件数: ${files.length}`);

console.log('\n🎉 构建完成！');
console.log('\n💡 使用方式:');
console.log('  1. HTML 框架: index.html (约 2KB)');
console.log('  2. 外部加载: style.css + game.js');
console.log('  3. 部署到 Cloudflare Pages 后自动生效');
