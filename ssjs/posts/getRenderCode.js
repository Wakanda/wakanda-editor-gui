var helpers     = require('./helpers');
var cheerio     = require('cheerio');

var getSourceCode = function(req, res){
  var sourceFileContent = req.body.sourceCode;
  var headScripts       = req.body.headScripts;
  var projectFile       = req.body.projectFile;

  var $ = cheerio.load(sourceFileContent);
  headScripts.forEach(function(scriptTagAsString){
    $('head').append(scriptTagAsString);
  });

  var renderPath = helpers.getRenderPath(projectFile);
  helpers.saveFile(renderPath, $.html());

  res.end({
    url: '/workspace/render/' + projectFile
  });

}


module.exports = getSourceCode;
