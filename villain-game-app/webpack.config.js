const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './game.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'game.js',
        clean: true,
        publicPath: './'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.ya?ml$/,
                type: 'asset/resource',
                generator: {
                    filename: '[name][ext]'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: 'index.html',
            inject: 'body',
            minify: false
        }),
        new MiniCssExtractPlugin({
            filename: 'style.css'
        }),
        new HtmlInlineScriptPlugin({
            htmlMatchPattern: [/\.html$/],
            scriptMatchPattern: [/\.js$/]
        }),
        new HTMLInlineCSSWebpackPlugin({
            filter: (fileName) => fileName.includes('style.css')
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: '反派逆袭系统指南.yaml',
                    to: '反派逆袭系统指南.yaml'
                }
            ]
        })
    ],
    optimization: {
        minimize: true
    },
    performance: {
        maxAssetSize: 10000000,
        maxEntrypointSize: 10000000
    }
};
