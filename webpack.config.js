/**
 * Created by zhangyatao on 2017/3/9.
 */

var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: ["./src/index.js"],
    devtool:'cheap-source-map',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'newBeeRouter.min.js',
        sourceMapFilename: '[file].map',
        libraryTarget: 'umd',
        library: 'NewBeeRouter'
    },
    resolve: {
        extensions: ['.js', '.json']
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({minimize: true})
    ]
};