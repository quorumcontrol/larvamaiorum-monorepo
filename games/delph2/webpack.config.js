const path = require("path")

module.exports = {
    entry: "./src/index.ts",
    mode: "production",
    module: {
        rules: [{
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                },
            }
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        symlinks: false,
        fallback: {
            crypto: require.resolve("crypto-browserify"),
            buffer: require.resolve("buffer/"),
            stream: require.resolve("stream-browserify"),
        },
    },
    optimization: {
        sideEffects: true,
        usedExports: true,
    },
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist/scripts"),
    },
}