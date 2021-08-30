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

const distPath = path.join(__dirname, 'dist');

module.exports = (env, argv) => {
    const MODE = argv.mode || 'development';
    const IS_PRODUCTION = MODE === "production";
    const CHUNK_NAME = true ? "[id].[chunkhash]" : "[id]";

    let config = {
        cache: !IS_PRODUCTION,
        entry: {
            index: "./src/index.tsx",
            testbed: "./src/testbed.tsx",
        },
        //stats: {
        //    children: true,
        //},
        target: "web",
        mode: MODE,
        watch: !IS_PRODUCTION,
        //watchOptions: {
        //    aggregateTimeout: 600,
        //    //ignored: ["./worker/", "./build/", "./dist/"],
        //},
        output: {
            filename: '[name].[fullhash].js',
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
            mangleExports: IS_PRODUCTION ? 'size' : 'deterministic',
            //runtimeChunk: 'single',
            minimize: IS_PRODUCTION,
            minimizer: [new TerserPlugin({
                parallel: true,
                terserOptions: {
                    sourceMap: !IS_PRODUCTION,
                    compress: {
                        ecma: 2015,
                        passes: 3,
                        unsafe_math: true,
                    }
                }
            })],
            splitChunks: {
                chunks: 'async',
                minChunks: 2,
                enforceSizeThreshold: 1024 * 1000,
                minSize: 1024 * 50,
            }
        },

        // Enable sourcemaps for debugging webpack's output.
        devtool: "source-map",

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
                { test: /\.tsx?$/, loader: "ts-loader" },

                // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
                { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },

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
                            },
                        },
                    ],
                },
                {
                    test: /fonts.*\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'static/fonts/[name].[ext]'
                    },
                },
                {
                    test: /icons.*\.svg$/,
                    type: 'asset/source',
                },
                {
                    test: /\.(jpg|jpeg|png|svg|wav)(\?v=\d+\.\d+\.\d+)?$/,
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
            // NOTE: The first two plugins here are reused in `webpack.vendors.config.js`
            new webpack.DefinePlugin({
                "typeof window": '"object"',
                "typeof MessageChannel": '"function"',
                "__DEV__": JSON.stringify(!IS_PRODUCTION),
                "__PRERELEASE__": JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false')),
                "process.env": {
                    'NODE_DEBUG': 'undefined',
                    'NODE_ENV': JSON.stringify(IS_PRODUCTION ? 'production' : 'development'),
                    'DEBUG': JSON.stringify(!IS_PRODUCTION),
                },
            }),
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
                //TextDecoder: ['text-encoding', 'TextDecoder'],
                //TextEncoder: ['text-encoding', 'TextEncoder']
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
                excludeChunks: ['testbed'],
                template: path.resolve(__dirname, "src", "index.html"),
            }),
            //new WasmPackPlugin({
            //    crateDirectory: path.resolve(__dirname, "worker/gateway"),
            //    extraArgs: "--target web",
            //    outDir: path.resolve(__dirname, "build/worker/gateway"),
            //}),
            //new BundleAnalyzerPlugin({
            //    analyzerMode: 'server',
            //    openAnalyzer: true,
            //}),
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: "[name].css",
                chunkFilename: `${CHUNK_NAME}.css`,
            }),
        ],
    };


    if(!IS_PRODUCTION) {
        config.plugins.push(new DllReferencePlugin({
            context: path.join(__dirname, "build"),
            manifest: require("./build/vendors-manifest.json"),
        }))
    }

    return config;
};