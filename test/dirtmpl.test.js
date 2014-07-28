var assert = require('power-assert');
var dirtmpl = require("../");

var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var temp = require('temp');

var home = process.env.HOME || process.env.USERPROFILE;
var basedir = path.join(home, '.config/dirtmpl');

var src = path.join(__dirname, "examples");
var foo = "foo.txt";
var baz = "bar/baz.txt";
var qux = "bar/quux/qux.txt";

function assertSameFileContent(file1, file2) {
    var options = { encoding: "utf8" };

    assert.equal(fs.readFileSync(file1, options), fs.readFileSync(file2, options));
}



describe('Dirtmpl', function() {
    var name = "example" + Date.now();

    it('should use a default configDir is ' + basedir, function () {
        assert.equal(dirtmpl().getConfigDir(), basedir);
    });

    it('should use configDir option', function () {
        var configDir = "/path/to/foo";

        assert.equal(dirtmpl({ configDir: configDir }).getConfigDir(), configDir);
    });



    describe('#add with configDir', function () {
        var dirname = temp.mkdirSync("dirtmpl_");
        var foofile = path.join(dirname, name, foo);
        var bazfile = path.join(dirname, name, baz);
        var quxfile = path.join(dirname, name, qux);

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

    describe('#build with configDir', function () {
        var output = temp.mkdirSync("dirtmpl_");
        var foofile = path.join(output, foo);
        var bazfile = path.join(output, baz);
        var quxfile = path.join(output, qux);

        before(function(done) {
            dirtmpl({ configDir: __dirname }).build("examples", output, done);
        });

        after(function () {
            if (fs.existsSync(output)) {
                rimraf.sync(output);
            }
        });

        it('should output a foo.txt to ' + foofile, function(){
            assert.ok(fs.existsSync(foofile));
            assertSameFileContent(foofile, path.join(src, foo));
        });

        it('should output a bar/baz.txt to ' + bazfile, function(){
            assert.ok(fs.existsSync(bazfile));
            assertSameFileContent(bazfile, path.join(src, baz));
        });

        it('should output a bar/quux/qux.txt to ' + quxfile, function(){
            assert.ok(fs.existsSync(quxfile));
            assertSameFileContent(quxfile, path.join(src, qux));
        });
    });


    it('should raise error if source dirname is not exists in #add', function (done) {
        var dirname = "/path/to/invalid_dirname" + Date.now();

        dirtmpl().add("invalid", dirname, function (err) {
            if (err) {
                done();
            } else {
                done(Error("not raise error"));
            }
        });
    });

    it('should raise error if source dirname is not exists in #build', function (done) {
        var dirname = "/path/to/invalid_dirname" + Date.now();

        dirtmpl({ configDir: dirname }).build("invalid", dirname, function (err) {
            if (err) {
                done();
            } else {
                done(Error("not raise error"));
            }
        });
    });
});