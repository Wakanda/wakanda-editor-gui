var helpers     = require('../helpers');
var cheerio     = require('cheerio');
var fs          = require('fs');

var getRenderCode = function(req, res){
  var sourceFileContent = req.body.sourceCode;
  var headScripts       = req.body.scriptTags;
  var projectFile       = req.body.projectFile;

  var $ = cheerio.load(sourceFileContent);
  headScripts.forEach(function(scriptTagAsString){
    $('head').append(scriptTagAsString);
  });

  var renderPath = helpers.getRenderPath(projectFile);
  helpers.saveFile(renderPath, $.html());

  res.json({
    renderUrl: '/workspace/render/' + projectFile
  });

}


module.exports = getRenderCode;