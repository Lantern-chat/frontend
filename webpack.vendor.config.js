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
        watch: false,
        entry: {
            vendors: "vendors.js",
        },
        target: "web",
        mode: "development",
        optimization: {},
    };

    config.output = {
        ...config.output,
        path: buildPath,
        filename: "dll.[name].js",
        library: '[name]'
    };

    // only take the required plugins, see webpack.config.js for these
    config.plugins = [
        ...config.plugins.slice(0, 2),
        new DllPlugin({
            path: path.join(__dirname, "build", "[name]-manifest.json"),
            name: "[name]",
            context: buildPath,
        })
    ];

    return config;
};