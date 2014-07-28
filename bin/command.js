#!/usr/bin/env node

var dirtmpl = require('../');
var argv = require('yargs').argv;
var fs = require('fs');
var format = require('util').format;

var command  = (argv._[0] || "help").toLowerCase();
var name     = argv._[1]  || "default";
var dirname  = argv._[2]  || ".";

var template = dirtmpl();

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
    console.log("run list.");
    break;

  case "rm":
  case "remove":
    console.log("run remove.");
    break;

  default:
    return renderUsage();
}
