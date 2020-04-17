const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
    mode: 'development',
    entry: [
        './src/app/bootstrap.js',
    ],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js'
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './build',
        compress: true,
        host: '0.0.0.0',
        port: 8000
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: 'src/index.html',
                to: 'index.html',
                force: true,
            },
            {
                from: 'src/index.css',
                to: 'index.css',
                force: true,
            },
            {
                from: 'src/assets/',
                to: 'assets/',
                force: true,
            },
            {
                from: 'src/manifest.json',
                to: 'manifest.json',
                force: true,
            },
        ]),
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                }
            }
        ]
    }
};
