const path = require("path");
const fs = require("fs");
const glob = require("glob");

function findLambdaEntries() {
    return glob.sync(path.join(__dirname, "./src/**/index.js"))
        .reduce((r, filepath) => {
            const entryName = /[^/]+(?=\/index\.js$)/.exec(filepath)[0];
            r[entryName] = filepath;
            return r;
        }, {});
}

module.exports = {
    entry: findLambdaEntries(),
    output: {
        path: path.join(__dirname, "build"),
        library: "[name]",
        libraryTarget: "commonjs2",
        filename: "[name].js"
    },
    target: "node",
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015'],
                    plugins: ['syntax-flow', 'transform-flow-strip-types']
                }
            },
            {
                test: /\.json$/,
                loader: 'json'
            }
        ]
    }
};