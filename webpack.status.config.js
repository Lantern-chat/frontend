const path = require("path");
const webpack = require("webpack");
const packageJson = require("./package.json");

const { LoaderOptionsPlugin, DllPlugin, DllReferencePlugin } = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');

const buildPath = path.join(__dirname, 'build');

const fullConfig = require('./webpack.config');

module.exports = (env, argv) => {
    const MODE = argv.mode || 'development';
    const IS_PRODUCTION = MODE === "production";
    const CHUNK_NAME = true ? "[id].[chunkhash]" : "[id]";

    let config = {
        ...fullConfig(env, argv),
        entry: {
            status: "./src/status.tsx",
        }
    };

    config.plugins = [
        ...config.plugins.slice(0, 2),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "src", "index.html"),
            filename: 'status.html',
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].css",
            chunkFilename: `${CHUNK_NAME}.css`,
        }),
    ];

    return config;
};