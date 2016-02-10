var helpers     = require('../helpers');
var cheerio     = require('cheerio');
var fs          = require('fs');

var saveProject = function(req, res){
  var sourceFileContent = req.body.sourceCode;
  var headScripts       = req.body.scriptTags;
  var projectFile       = req.body.projectFile;

  var $ = cheerio.load(sourceFileContent);
  headScripts.forEach(function(scriptTagAsString){
    $('head').append(scriptTagAsString);
  });

  var projectPath = helpers.getProjectPath(projectFile);
  helpers.saveFile(projectPath, $.html());

  res.json({
    saved: 'yes'
  });

}


module.exports = saveProject;
