var path   = require('path');
var mkdirp = require('mkdirp');
var fs     = require('fs');
var config = require('./config');


var exportObject = {};

exportObject.getSourcePath = function(filePath){
  return path.resolve(config.workspaceDirectory, 'src', filePath);
};

exportObject.getRenderPath = function(filePath){
  return path.resolve(config.workspaceDirectory, 'render', filePath);
};

exportObject.getProjectPath = function(filePath){
  return path.resolve(config.projectDirectory, filePath);
};

exportObject.saveFile = function(filePath, fileContent){
  var folderPath = path.dirname(filePath);
  mkdirp.sync(folderPath);
  fs.writeFileSync(filePath, fileContent);
};


module.exports = exportObject;
