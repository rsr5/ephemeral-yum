
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname + '/repo')).listen(8080);
