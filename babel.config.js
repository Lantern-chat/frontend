module.exports = {
    presets: [
        ["@babel/preset-env", {
            modules: false,
            useBuiltIns: "entry",
            corejs: "3",
            loose: true,
            targets: {
                browsers: [">95%", 'not ie > 0'],
                ios: "14",
                //esmodules: true
            }
        }],
        ["solid", {}],
        ['@babel/preset-typescript', {
            optimizeConstEnums: true,
        }],
    ],
    plugins: [
        [require.resolve('babel-plugin-module-resolver'), {
            root: ["./src"],
            extensions: [".js", ".jsx", ".es", ".es6", ".mjs", ".ts", ".tsx"]
        }]
    ]
};