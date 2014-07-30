#!/usr/bin/env node

var dirtmpl = require('../');
var argv = require('yargs').argv;
var fs = require('fs');
var path = require('path');
var format = require('util').format;

var command  = (argv._[0] || "help").toLowerCase();
var name     = argv._[1]  || "default";
var dir      = argv._[2]  || ".";

var configDir = argv.configDir ? path.resolve(argv.configDir) : undefined;
var dirname = path.resolve(dir);

var template = dirtmpl({ configDir: configDir });

function renderUsage() {
    fs.createReadStream(__dirname + '/usage.txt').pipe(process.stdout);
}


if (command === 'help' || argv.h || argv.help) {
    return renderUsage();
}

switch (command) {
  case "add":
    template.add(name, dirname, function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log(format('Added directory template "%s"', name));
        }
    });

    break;

  case "build":
    template.build(name, dirname, function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log(format('Wrote directory template "%s" to %s', name, dirname));
        }
    });

    break;

  case "list":
  case "ls":
    template.list(function (err, templates) {
        if (err) {
            console.error(err);
        } else {
            if (templates && templates.length) {
                console.log(templates.join('\n'));
            }
        }
    });
    break;

  case "rm":
  case "remove":
    template.remove(name, function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log(format('Removed directory template "%s"', name));
        }
    });
    break;

  default:
    return renderUsage();
}
