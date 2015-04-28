
var temp        = require('temp'),
    fs          = require('fs'),
    util        = require('util'),
    path        = require('path'),
    exec        = require('child_process').exec,
    rimraf      = require('rimraf'),
    connect     = require('connect'),
    serveStatic = require('serve-static'),
    parseArgs   = require('minimist'),
    fsextra     = require('fs-extra');

// Parse the command line args
var argv = parseArgs(process.argv.slice(2));
var rpms = argv['_']

if (rpms.length === 0) {
    console.log("You need to specify one or more RPM files.");
}

// Setup a temporary directory for the repository
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

    // Copy the RPM into place.
    rpms.push('END');
    for (var i in rpms) {
        if (rpms[i] === "END") {

            // Create the repository file structure
            var cwd = process.cwd();
            process.chdir(dirPath);
            exec('createrepo .', function (error, stdout, stderr) {
              console.log(stdout)
              console.log(stderr)
              console.log("Created Yum Repository at " + process.cwd());
              process.chdir(cwd);

              console.log("Repository ready and waiting.")
              connect().use(serveStatic(dirPath)).listen(8080);
            });

        } else {
            console.log("Copying " + rpms[i]);
            fsextra.copy(rpms[i], dirPath + "/" + path.basename(rpms[i]), function (err) {
            if (err) return console.error(err)
            });

        }
    }
});
