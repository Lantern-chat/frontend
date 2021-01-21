const path = require("path");
const webpack = require("webpack");
const packageJson = require("./package.json");

const { LoaderOptionsPlugin } = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');

const distPath = path.join(__dirname, 'dist');

module.exports = (env, argv) => {
    const MODE = argv.mode || 'development';
    const IS_PRODUCTION = MODE === "production";
    const CHUNK_NAME = IS_PRODUCTION ? "[chunkhash]" : "[id]";

    return {
        entry: "./src/index.tsx",
        target: "web",
        mode: MODE,
        watch: !IS_PRODUCTION,
        output: {
            filename: '[name].js',
            chunkFilename: `${CHUNK_NAME}.js`,
            path: distPath,
            publicPath: 'static/',
        },
        node: {
            global: true,
            __filename: false,
            __dirname: false,
        },
        optimization: {
            mangleExports: IS_PRODUCTION ? 'size' : 'deterministic',
            minimize: IS_PRODUCTION,
            minimizer: [new TerserPlugin({
                parallel: true,
                terserOptions: {
                    sourceMap: !IS_PRODUCTION,
                    compress: {
                        passes: 3,
                        unsafe_math: true,
                    }
                }
            })],
            splitChunks: {
                chunks: 'all',
                minChunks: 3,
            }
        },

        // Enable sourcemaps for debugging webpack's output.
        devtool: "source-map",

        devServer: {
            contentBase: distPath,
            compress: true,
            port: 9000
        },
        performance: {
            hints: false
        },
        resolve: {
            roots: [path.resolve("./src"), __dirname],
            extensions: [".ts", ".jsx", ".tsx", ".js", ".json"],
            alias: {
                modernizr$: path.resolve(__dirname, 'src/.modernizrrc'),
                //"react": "preact/compat",
                //"react-dom/test-utils": "preact/test-utils",
                //"react-dom": "preact/compat",
            },
            plugins: [
                new TsconfigPathsPlugin({ configFile: "./tsconfig.json" }),
            ]
        },
        module: {
            rules: [
                { test: /\.tsx?$/, loader: "ts-loader" },

                // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
                { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },

                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                // you can specify a publicPath here
                                // by default it use publicPath in webpackOptions.output
                                //publicPath: '../'
                            }
                        },
                        'css-loader',
                        'postcss-loader',
                        {
                            loader: "sass-loader",
                            options: {
                                sassOptions: {
                                    includePaths: ["src/ui/styles"],
                                },
                            },
                        },
                    ],
                },
                {
                    test: /fonts.*\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'fonts/'
                            }
                        }
                    ]
                },
                {
                    test: /icons.*\.svg$/,
                    type: 'asset/inline',
                    generator: {
                        dataUrl: content => content.toString()
                    }
                },
                {
                    test: /\.(jpg|jpeg|png|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    exclude: /(icons|fonts)/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: `[name].[ext]`,
                                outputPath: 'assets/'
                            }
                        }
                    ]
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                "typeof window": '"object"',
                "typeof MessageChannel": '"function"',
            }),
            new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, "src", "index.html"),
            }),
            new BundleAnalyzerPlugin({
                analyzerMode: 'server',
                openAnalyzer: true,
            }),
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: "[name].css",
                chunkFilename: `${CHUNK_NAME}.css`,
            }),
        ],
    }
};