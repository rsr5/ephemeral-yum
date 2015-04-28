
var temp        = require('temp'),
    fs          = require('fs'),
    util        = require('util'),
    path        = require('path'),
    exec        = require('child_process').exec,
    rimraf      = require('rimraf'),
    connect     = require('connect'),
    serveStatic = require('serve-static');

temp.mkdir('ephemeralyum', function(err, dirPath) {

    process.stdin.resume();//so the program will not close instantly

    function exitHandler(options, err) {

        rimraf(dirPath, function() {
            console.log("Removed " + dirPath);
            if (options.cleanup) console.log('clean');
            if (err) console.log(err.stack);
            if (options.exit) process.exit();
        });
    }

    // cleanup when app is closing
    process.on('exit', exitHandler.bind(null,{cleanup:true}));

    // catches ctrl+c event and cleans up
    process.on('SIGINT', exitHandler.bind(null, {exit:true}));

    // catches uncaught exceptions and cleans up
    process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

    // Automatically track and cleanup files at exit
    temp.track();

    console.log("Created " + dirPath);

    // Copy the RPM into place.
    fs.createReadStream('/opt/yumrepo/repo/testpackage-1.0-1.x86_64.rpm').pipe(fs.createWriteStream(dirPath + '/testpackage-1.0-1.x86_64.rpm'));

    var cwd = process.cwd();
    process.chdir(dirPath);
    exec('createrepo .', function (error, stdout, stderr) {
      console.log(stdout)
      console.log(stderr)
      console.log("Created Yum Repository at " + process.cwd());
      process.chdir(cwd);
    });

    connect().use(serveStatic(dirPath)).listen(8080);

});
