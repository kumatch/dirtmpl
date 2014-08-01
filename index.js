var fs = require('fs');
var path = require('path');
var lockedpath = require('lockedpath');
var ncp = require('ncp').ncp;
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var cleanupdir = require('cleanupdir');

var home = process.env.HOME || process.env.USERPROFILE;

module.exports = function (options) {
    if (!options) options = {};

    var configDir = (options.configDir || path.join(home, '.config', 'dirtmpl')).replace(/[\/]$/, "");
    var cleanBuild = options.clean ? true : false;

    function createPath (name) {
        return lockedpath(configDir).join(name);
    }

    return {
        getConfigDir: function () {
            return configDir;
        },

        add: function (name, src, callback) {
            fs.exists(src, function (exists) {
                if (!exists) {
                    callback(Error("not exists: " + src));
                    return;
                }

                var dst = createPath(name);

                if (dst === configDir) {
                    callback(Error("invalid name: " + name));
                    return;
                }

                fs.exists(dst, function (exists) {
                    if (exists) {
                        callback(Error("already exists: " + name));
                        return;
                    }

                    mkdirp(dst, function (err) {
                        if (err) {
                            callback(err);
                        } else {
                            ncp(src, dst, callback);
                        }
                    });
                });
            });
        },


        build: function (name, dst, callback) {
            var src = createPath(name);

            if (src === configDir) {
                callback(Error("invalid name: " + name));
                return;
            }

            fs.exists(src, function (exists) {
                if (!exists) {
                    callback(Error("not exists: " + name));
                    return;
                }


                var afterCopy = function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        ncp(src, dst, callback);
                    }
                };

                fs.exists(dst, function (exists) {
                    if (!exists) {
                        mkdirp(dst, afterCopy);
                    } else {
                        if (cleanBuild) {
                            cleanupdir(dst, afterCopy);
                        } else {
                            afterCopy();
                        }
                    }
                });
            });
        },

        list: function (callback) {
            fs.readdir(configDir, function (err, files) {
                if (err) {
                    callback(err);
                } else {
                    var results = files.filter(function (file) {
                        var filename = path.join(configDir, file);
                        return fs.statSync(filename).isDirectory();
                    });

                    callback(null, results);
                }
            });
        },

        remove: function (name, callback) {
            var template = createPath(name);

            if (template === configDir) {
                callback(Error("invalid name: " + name));
                return;
            }

            rimraf(template, callback);
        }
    };
};
