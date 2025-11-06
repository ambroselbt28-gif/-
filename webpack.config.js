const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;

module.exports = {
    mode: 'production',
    entry: './game.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.ya?ml$/,
                type: 'asset/source'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: 'index.html',
            inject: 'body',
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                useShortDoctype: true
            }
        }),
        new MiniCssExtractPlugin({
            filename: 'style.css'
        }),
        new HtmlInlineScriptPlugin(), // 内联所有 JS
        new HTMLInlineCSSWebpackPlugin() // 内联所有 CSS
    ],
    optimization: {
        minimize: true,
        splitChunks: {
            chunks: 'all',
            maxSize: 0, // 不拆分，保持单文件
        }
    },
    performance: {
        maxAssetSize: 5000000, // 5MB
        maxEntrypointSize: 5000000
    }
};
