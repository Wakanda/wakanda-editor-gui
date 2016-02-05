var config      = require('./config');
var helpers     = require('./helpers');
var cheerio     = require('cheerio');

var getSourceCode = function(req, res){
  var projectFile = req.body.projectFile;
  var projectFilePath = helpers.getSourcePath(projectFile);
  console.log('geting the source code of ', projectFilePath, 'req: ', req.body.projectFile);

  var fileContent = fs.readFileSync(projectFilePath, 'utf8');

  var $ = cheerio.load('fileContent');

  var headScripts = $('head > script');
  headScripts.each(function () {
    var $this = $(this);
    headScripts.push($this.html());
  });
  headScripts.remove();

  var sourcePath = helpers.getSourcePath(projectFile);
  console.log('saving source code in: ', sourcePath);
  helpers.saveFile(sourcePath, $.html())

  res.end({
    headScripts: headScripts,
    sourceUrl:   '/workspace/src/' + projectFile
  });
}


module.exports = getSourceCode;
