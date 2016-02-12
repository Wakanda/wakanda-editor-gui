var helpers     = require('../helpers');
var cheerio     = require('cheerio');
var fs          = require('fs');

var getSourceCode = function(req, res){
  var projectFile = req.body.projectFile;
  var projectFilePath = helpers.getProjectPath(projectFile);
  console.log('geting the source code of ', projectFilePath, 'req: ', req.body.projectFile);

  var fileContent = fs.readFileSync(projectFilePath, 'utf8');

  var $ = cheerio.load(fileContent);

  var headScriptsStr = [];

  var headScripts = $('head > script');
  headScripts.each(function () {
    var $this = $(this);
    headScriptsStr.push($.html($this));
  });
  headScripts.remove();

  var sourcePath = helpers.getSourcePath(projectFile);
  helpers.saveFile(sourcePath, $.html());

  res.json({
    headScripts: headScriptsStr,
    sourceUrl:   '/workspace/src/' + projectFile
  });
}


module.exports = getSourceCode;
