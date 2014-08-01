var assert = require('power-assert');
var dirtmpl = require("../");

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var temp = require('temp');

var home = process.env.HOME || process.env.USERPROFILE;
var basedir = path.join(home, '.config/dirtmpl');

var sampleDir = path.join(__dirname, "examples");
var templateName  = "abc";
var foo = "foo.txt";
var baz = "bar/baz.txt";
var qux = "bar/quux/qux.txt";

function assertSameFileContent(file1, file2) {
    var options = { encoding: "utf8" };

    assert.equal(fs.readFileSync(file1, options), fs.readFileSync(file2, options));
}



describe('Dirtmpl', function() {
    it('should use a default configDir is ' + basedir, function () {
        assert.equal(dirtmpl().getConfigDir(), basedir);
    });

    it('should use configDir option', function () {
        var configDir = "/path/to/foo";

        assert.equal(dirtmpl({ configDir: configDir }).getConfigDir(), configDir);
    });
});

describe('Dirtmpl#add with configDir', function () {
    var name = "example" + Date.now();

    var dirname = temp.mkdirSync("dirtmpl_");
    var foofile = path.join(dirname, name, foo);
    var bazfile = path.join(dirname, name, baz);
    var quxfile = path.join(dirname, name, qux);

    var src = path.join(sampleDir, templateName);

    before(function(done) {
        dirtmpl({ configDir: dirname }).add(name, src, done);
    });

    after(function () {
        if (fs.existsSync(dirname)) {
            rimraf.sync(dirname);
        }
    });

    it('should copy a foo.txt to ' + foofile, function(){
        assert.ok(fs.existsSync(foofile));
        assertSameFileContent(foofile, path.join(src, foo));
    });

    it('should copy a bar/baz.txt to ' + bazfile, function(){
        assert.ok(fs.existsSync(bazfile));
        assertSameFileContent(bazfile, path.join(src, baz));
    });

    it('should copy a bar/quux/qux.txt to ' + quxfile, function(){
        assert.ok(fs.existsSync(quxfile));
        assertSameFileContent(quxfile, path.join(src, qux));
    });
});

describe('Dirtmpl#build with configDir', function () {
    var name = "example" + Date.now();

    var output = temp.mkdirSync("dirtmpl_");
    var foofile = path.join(output, foo);
    var bazfile = path.join(output, baz);
    var quxfile = path.join(output, qux);

    before(function(done) {
        dirtmpl({ configDir: sampleDir }).build(templateName, output, done);
    });

    after(function () {
        if (fs.existsSync(output)) {
            rimraf.sync(output);
        }
    });

    it('should output a foo.txt to ' + foofile, function(){
        assert.ok(fs.existsSync(foofile));
        assertSameFileContent(foofile, path.join(sampleDir, templateName, foo));
    });

    it('should output a bar/baz.txt to ' + bazfile, function(){
        assert.ok(fs.existsSync(bazfile));
        assertSameFileContent(bazfile, path.join(sampleDir, templateName, baz));
    });

    it('should output a bar/quux/qux.txt to ' + quxfile, function(){
        assert.ok(fs.existsSync(quxfile));
        assertSameFileContent(quxfile, path.join(sampleDir, templateName, qux));
    });
});


describe('Dirtmpl#list with configDir', function () {
    var entries = [];

    before(function(done) {
        dirtmpl({ configDir: sampleDir }).list(function (err, results) {
            entries = results;
            done(err);
        });
    });

    it('should get two templates', function(){
        assert.equal(entries.length, 2);
    });

    it('should get tempalte "abc"', function(){
        assert.equal(entries[0], "abc");
    });

    it('should get tempalte "def"', function(){
        assert.equal(entries[1], "def");
    });
});

describe('Dirtmpl#remove with configDir', function () {
    var name = "example" + Date.now();
    var configDir = temp.mkdirSync("dirtmpl_");
    var template_path = path.join(configDir, name);

    before(function(done) {
        mkdirp.sync(template_path);

        if (!fs.existsSync(template_path)) {
            done(Error("failed to create example directory."));
            return;
        }

        dirtmpl({ configDir: configDir }).remove(name, done);
    });

    after(function () {
        if (fs.existsSync(configDir)) {
            rimraf.sync(configDir);
        }
    });

    it('should remove a template directory', function(){
        assert.ok(fs.existsSync(template_path) === false);
    });
});



describe('Dirtmpl errors', function () {
    var dirname = "/path/to/invalid_dirname" + Date.now();

    it('should raise error if source dirname is not exists in #add', function (done) {

        dirtmpl().add("invalid", dirname, function (err) {
            if (err && err.message.match(/not exists/)) {
                done();
            } else {
                done(Error("not raise error"));
            }
        });
    });

    it('should raise error if stores template path is configDir in #add', function (done) {
        var src = path.join(sampleDir, templateName);

        dirtmpl({ configDir: dirname }).add("..", src, function (err) {
            if (err && err.message.match(/invalid name/)) {
                done();
            } else {
                done(Error("not raise error"));
            }
        });
    });

    it('should raise error if same name templates is eixets in #add', function (done) {
        var configDir = temp.mkdirSync("dirtmpl_");
        var src = path.join(sampleDir, templateName);

        mkdirp.sync(path.join(configDir, templateName));

        dirtmpl({ configDir: configDir }).add(templateName, src, function (err) {
            rimraf.sync(configDir);

            if (err) {
                done();
            } else {
                done(Error("not raise error"));
            }
        });
    });

    it('should raise error if source dirname is not exists in #build', function (done) {
        dirtmpl({ configDir: dirname }).build("invalid", dirname, function (err) {
            if (err && err.message.match(/not exists/)) {
                done();
            } else {
                done(Error("not raise error"));
            }
        });
    });

    it('should raise error if source template path is configDir in #build', function (done) {
        dirtmpl({ configDir: sampleDir }).build("..", dirname, function (err) {
            if (err && err.message.match(/invalid name/)) {
                done();
            } else {
                done(Error("not raise error"));
            }
        });
    });

    it('should raise error if target template path is configDir in #remove', function (done) {
        dirtmpl({ configDir: dirname }).build("..", dirname, function (err) {
            if (err) {
                done();
            } else {
                done(Error("not raise error"));
            }
        });
    });
});
