var environment = process.env.NODE_ENV || "development";

var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var ejs = require('ejs');

//must end with .build.ejs
var filesToCompile = [
  "./index.build.ejs"
];

var pluginsToLoad = [
  new webpack.HotModuleReplacementPlugin()
];

pluginsToLoad.push(function() {
  this.plugin("done", function(stats) {
    filesToCompile.forEach(function(fileName) {
      var source = fs.readFileSync(path.join(__dirname, fileName), {
        encoding: 'utf8'
      });
      var target = ejs.render(source, {
        env: environment,
        hash: stats.hash
      });
      var targetFileName = fileName.replace('.build.ejs', '.html');
      fs.writeFileSync(
        path.join(__dirname, targetFileName),
        target
      );
      process.stdout.write('File ' + fileName + ' processed to ' + targetFileName + '\n');
    });
  });
});

module.exports = {
  entry: [
    "webpack/hot/dev-server",
    "./main.js"
  ],
  output: {
    filename: environment === 'production' ? "[name].build.[hash].js" : "[name].build.js",
    path: __dirname + "/build/assets/js/",
    publicPath: '/build/assets/js/'
  },
  resolve: {
    alias: {
      "jquery": "../jquery-2.1.3.min.js",
      "alias-example-logger": path.join(__dirname, './alias-example/logger/console.' + environment + '.js'),
      "alias-example-geoloc-geoip": path.join(__dirname, './alias-example/geoloc/lib/geoip' + (environment === 'test' ? '.stub' : '') + '.js')
    }
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: [
        /node_modules/,
        path.resolve(__dirname, "./lib/ace-min-noconflict/ace"),
        /typescriptServices/i
      ],
      loader: 'babel-loader'
    }, {
      test: /\.css$/,
      exclude: /node_modules/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.png$/,
      loader: "url-loader?limit=100000&mimetype=image/png"
    }]
  },
  plugins: pluginsToLoad
};
