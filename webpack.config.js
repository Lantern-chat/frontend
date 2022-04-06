const path = require("path");
const webpack = require("webpack");
const packageJson = require("./package.json");

const { LoaderOptionsPlugin, DllPlugin, DllReferencePlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin');

const distPath = path.join(__dirname, 'dist');

const ENABLE_PRODUCTION = true;

function makeMinimizer() {
    const TerserPlugin = require('terser-webpack-plugin');

    return [new TerserPlugin({
        parallel: true,
        terserOptions: {
            sourceMap: false, //!IS_PRODUCTION,
            compress: {
                ecma: 2015,
                passes: 3,
                unsafe_math: true,
            },
            mangle: true,
            format: {
                beautify: false
            }
        }
    })];
}

module.exports = (env, argv) => {
    const MODE = argv.mode || 'development';
    const IS_PRODUCTION = MODE === "production";
    const CHUNK_NAME = (ENABLE_PRODUCTION && IS_PRODUCTION) ? "[id].[chunkhash]" : "[id]";

    let config = {
        cache: !IS_PRODUCTION,
        entry: {
            index: "./src/index.tsx",
        },
        target: "web",
        devtool: 'source-map',
        mode: MODE,
        watch: !IS_PRODUCTION,
        output: {
            filename: (ENABLE_PRODUCTION && IS_PRODUCTION) ? '[name].[fullhash].js' : '[name].js',
            chunkFilename: `${CHUNK_NAME}.js`,
            path: distPath,
            publicPath: '/static/',
            crossOriginLoading: 'use-credentials',
        },
        node: {
            global: true,
            __filename: false,
            __dirname: false,
        },
        optimization: {
            //chunkIds: IS_PRODUCTION ? 'size' : 'natural',
            //moduleIds: IS_PRODUCTION ? 'size' : false,
            mangleExports: (ENABLE_PRODUCTION && IS_PRODUCTION) ? 'size' : 'deterministic',
            //runtimeChunk: 'single',
            minimize: ENABLE_PRODUCTION && IS_PRODUCTION,
            minimizer: IS_PRODUCTION ? makeMinimizer() : undefined,
            splitChunks: {
                chunks: 'async',
                minChunks: 2,
                enforceSizeThreshold: 1024 * 1000,
                minSize: 1024 * 50,
            }
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
                //preact: path.resolve(__dirname, 'node_modules', 'preact'),
                //'preact/hooks': path.resolve(__dirname, 'node_modules', 'preact', 'hooks'),
            },
            plugins: [
                new TsconfigPathsPlugin({ configFile: "./tsconfig.json" }),
            ],
            fallback: {
                "assert": require.resolve("assert/"),
                //"util": require.resolve("util/"),
            }
        },
        module: {
            rules: [
                {
                    test: /\.[tj]sx?$/,
                    use: {
                        loader: 'babel-loader',
                    }
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        // TODO: Investigate style-loader more
                        false ? "style-loader" : {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                // you can specify a publicPath here
                                // by default it use publicPath in webpackOptions.output
                                //publicPath: '../'
                                esModule: true,
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
                                additionalData: `$__DEV__: ${!IS_PRODUCTION};`,
                            },
                        },
                    ],
                },
                {
                    test: /fonts.*\.(woff(2)?|ttf|eot|svg|otf)(\?v=\d+\.\d+\.\d+)?$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'fonts/[name][ext]'
                    },
                },
                {
                    test: /icons.*\.svg$/,
                    type: 'asset/source',
                },
                {
                    test: /\.(jpg|jpeg|png|svg|wav)(\?v=\d+\.\d+\.\d+)?$/,
                    exclude: /(icons|fonts)/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'assets/[hash][ext][query]'
                    }
                    //use: [
                    //    {
                    //        loader: 'file-loader',
                    //        options: {
                    //            name: `[name].[ext]`,
                    //            outputPath: 'assets/',
                    //            useRelativePaths: true,
                    //            publicPath: '../'
                    //        }
                    //    }
                    //]
                },
            ]
        },
        plugins: [
            new ForkTsCheckerWebpackPlugin(),
            // NOTE: The first two plugins here are reused in `webpack.vendors.config.js`
            new webpack.DefinePlugin({
                "typeof window": '"object"',
                "typeof MessageChannel": '"function"',
                "__DEV__": JSON.stringify(!IS_PRODUCTION),
                "__PRERELEASE__": JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false')),
                "__TEST__": "false",
                "process": {
                    "env": {
                        'NODE_DEBUG': 'undefined',
                        'NODE_ENV': JSON.stringify(IS_PRODUCTION ? 'production' : 'development'),
                        'DEBUG': JSON.stringify(!IS_PRODUCTION),
                    }
                },
                "DO_NOT_EXPORT_CRC": "undefined"
            }),
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
                //TextDecoder: ['text-encoding', 'TextDecoder'],
                //TextEncoder: ['text-encoding', 'TextEncoder']
            }),
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: "[name].css",
                chunkFilename: `${CHUNK_NAME}.css`,
            }),

            //new SubresourceIntegrityPlugin(),
            //new SriPlugin({
            //    hashFuncNames: ['sha256'],
            //    enabled: IS_PRODUCTION,
            //}),

            //new HtmlWebpackPlugin({
            //    excludeChunks: ['index'],
            //    template: path.resolve(__dirname, "src", "index.html"),
            //    filename: 'testbed.html'
            //}),
            new HtmlWebpackPlugin({
                //excludeChunks: ['testbed', 'status'],
                template: path.resolve(__dirname, "src", "index.html"),
                filename: 'index.html',
            }),
            new PreloadWebpackPlugin({
                rel: 'preload',
                include: 'allAssets',
                as: 'font',
                fileWhitelist: [/Lato-(Regular|Bold|Black|Italic)\.woff2$/i],
            }),
            //new HTMLInlineCSSWebpackPlugin(),
            //new WasmPackPlugin({
            //    crateDirectory: path.resolve(__dirname, "worker/gateway"),
            //    extraArgs: "--target web",
            //    outDir: path.resolve(__dirname, "build/worker/gateway"),
            //}),
            new BundleAnalyzerPlugin({
                analyzerMode: (IS_PRODUCTION && ENABLE_PRODUCTION) ? 'static' : 'server',
                openAnalyzer: true,
            }),
            new CopyPlugin({
                patterns: [
                    { from: "./assets", to: "assets" },
                    { from: "./manifest.json", to: "manifest.json" }
                ]
            }),
        ],
    };

    return config;
};