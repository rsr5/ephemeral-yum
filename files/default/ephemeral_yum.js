
var temp = require('temp'),
    fs   = require('fs'),
    util = require('util'),
    path = require('path'),
    exec = require('child_process').exec;

// Automatically track and cleanup files at exit
temp.track();

temp.mkdir('ephemeralyum', function(err, dirPath) {
    var connect = require('connect');
    var serveStatic = require('serve-static');

    console.log(dirPath)
    fs.createReadStream('/opt/yumrepo/repo/testpackage-1.0-1.x86_64.rpm').pipe(fs.createWriteStream(dirPath + '/testpackage-1.0-1.x86_64.rpm'));

    process.chdir(dirPath);
    exec('createrepo .', function (error, stdout, stderr) {
    console.log(stdout)
    console.log(stderr)
    console.log("Created Yum Repository at " + process.cwd());
    });

    connect().use(serveStatic(dirPath)).listen(8080);

});
