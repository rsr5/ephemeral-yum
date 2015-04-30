#!/usr/bin/env node

/*
 * A service that creates a Yum repository which only exists for the duration
 * that the service is active.
 */

var temp        = require('temp'),
    fs          = require('fs'),
    util        = require('util'),
    path        = require('path'),
    exec        = require('child_process').exec,
    spawn       = require('child_process').spawn,
    rimraf      = require('rimraf'),
    connect     = require('connect'),
    serveStatic = require('serve-static'),
    parseArgs   = require('minimist'),
    fsextra     = require('fs-extra'),
    _           = require('underscore');

// Parse the command line args
var argv = parseArgs(process.argv.slice(2));
var rpms = argv['_'];
if (!_.isArray(rpms)) {
    rpms = [rpms]
}
var command = argv["c"].split(" ")[0];
var command_args = argv["c"].split(" ").slice(1).join(" ");
if (!_.isArray(command_args)) {
    command_args = [command_args]
}
console.log(command);
console.log(command_args);

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

                console.log("Repository ready, running " +
                            command + " " + command_args);

                subcommand = spawn(command, command_args)
                subcommand.stdout.on('data', function (data) {
                    process.stdout.write(data);
                });
                subcommand.stderr.on('data', function (data) {
                    process.stderr.write(data);
                });

                subcommand.on('close', function (code) {

                    rimraf(dirPath, function() {
                        console.log("Removed repo at " + dirPath);
                        console.log("Child finished, exited with " + code);
                        process.exit(code);
                    });
                });
            });

        } else {
            console.log("Copying " + rpms[i] + " to " + dirPath + "/" + path.basename(rpms[i]));
            fsextra.copySync(rpms[i], dirPath + "/" + path.basename(rpms[i]));

        }
    }

    connect().use(serveStatic(dirPath)).listen(8080, function() {
        console.log("Listening...");
    });
});
