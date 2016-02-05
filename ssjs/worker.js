var express       = require('express');

var app = express();
require('./middleware')(app);

var getSourceCode = require('./posts/getSourceCode');
var getRenderCode = require('./posts/getRenderCode');
app.post('/getSourceCode', getSourceCode);
app.post('/getRenderCode', getRenderCode);
app.post('/saveProject',   saveProject);


var server = app.listen(3001, '0.0.0.0', function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
