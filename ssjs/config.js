var path = require('path');

var exportObject = {};

var currentDirectory              = process.cwd();
exportObject.currentDirectory     = currentDirectory;
exportObject.projectDirectory     = path.resolve(currentDirectory, '../projects');
exportObject.workspaceDirectory   = path.resolve(currentDirectory, '../workspace');


module.exports = exportObject;
