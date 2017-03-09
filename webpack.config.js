/**
 * Created by zhangyatao on 2017/3/9.
 */

var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'newBeeRouter.js',
        sourceMapFilename: '[file].map',
        libraryTarget: 'umd',
        library: 'NewBeeRouter',
        pathinfo: true
    },
    resolve: {
        extensions: ['.js', '.json']
    }
};