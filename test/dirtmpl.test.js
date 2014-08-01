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

    var configDir = temp.mkdirSync("dirtmpl_");
    var foofile = path.join(configDir, name, foo);
    var bazfile = path.join(configDir, name, baz);
    var quxfile = path.join(configDir, name, qux);

    var template;

    beforeEach(function() {
        template = dirtmpl({ configDir: configDir });
    });

    afterEach(function () {
        if (fs.existsSync(configDir)) {
            rimraf.sync(configDir);
        }
    });

    it('should copy a files / directories.', function(done) {
        var src = path.join(sampleDir, templateName);

        template.add(name, src, function (err) {
            assert.ok(fs.existsSync(foofile));
            assertSameFileContent(foofile, path.join(src, foo));

            assert.ok(fs.existsSync(bazfile));
            assertSameFileContent(bazfile, path.join(src, baz));

            assert.ok(fs.existsSync(quxfile));
            assertSameFileContent(quxfile, path.join(src, qux));

            done(err);
        });
    });

    it('should raise error if source dirname is not exists.', function (done) {
        var source = "/path/to/invalid_source_directory";

        template.add("invalid", source, function (err) {
            if (err && err.message.match(/not exists/)) {
                done();
            } else {
                done(Error("not raise error"));
            }
        });
    });

    it('should raise error if stores template path is configDir.', function (done) {
        var src = path.join(sampleDir, templateName);

        template.add("..", src, function (err) {
            if (err && err.message.match(/invalid name/)) {
                done();
            } else {
                done(Error("not raise error"));
            }
        });
    });

    it('should raise error if same names template is already eixets.', function (done) {
        mkdirp.sync(path.join(configDir, templateName));

        var src = path.join(sampleDir, templateName);

        template.add(templateName, src, function (err) {
            if (err) {
                done();
            } else {
                done(Error("not raise error"));
            }
        });
    });

});

describe('Dirtmpl#build with configDir', function () {
    var name = "example" + Date.now();

    var output = temp.mkdirSync("dirtmpl_");
    var foofile = path.join(output, foo);
    var bazfile = path.join(output, baz);
    var quxfile = path.join(output, qux);

    var template;

    beforeEach(function() {
        template = dirtmpl({ configDir: sampleDir });
    });

    afterEach(function () {
        if (fs.existsSync(output)) {
            rimraf.sync(output);
        }
    });


    it('should generate a files / directories to a empty directory.', function(done) {
        template.build(templateName, output, function (err) {
            assert.ok(fs.existsSync(foofile));
            assertSameFileContent(foofile, path.join(sampleDir, templateName, foo));

            assert.ok(fs.existsSync(bazfile));
            assertSameFileContent(bazfile, path.join(sampleDir, templateName, baz));

            assert.ok(fs.existsSync(quxfile));
            assertSameFileContent(quxfile, path.join(sampleDir, templateName, qux));

            done(err);
        });
    });

    describe("to contained directory", function () {
        var existsFile1 = path.join(output, "aaaaaa.txt");
        var existsFile2 = path.join(output, "bbbbbb/cccccc.txt");
        var content = "exists file text.";

        beforeEach(function () {
            mkdirp.sync(path.dirname(existsFile2));
            fs.writeFileSync(existsFile1, content);
            fs.writeFileSync(existsFile2, content);
        });

        it('should generate and merge a files / directories.', function(done) {
            template.build(templateName, output, function (err) {
                assert.ok(fs.existsSync(foofile));
                assertSameFileContent(foofile, path.join(sampleDir, templateName, foo));

                assert.ok(fs.existsSync(bazfile));
                assertSameFileContent(bazfile, path.join(sampleDir, templateName, baz));

                assert.ok(fs.existsSync(quxfile));
                assertSameFileContent(quxfile, path.join(sampleDir, templateName, qux));

                assert.ok(fs.existsSync(existsFile1));
                assert.ok(fs.existsSync(existsFile2));
                assert.equal(fs.readFileSync(existsFile1), content);
                assert.equal(fs.readFileSync(existsFile2), content);

                done(err);
            });
        });

        it('should generate clean a files / directories if clean options.', function(done) {
            var template = dirtmpl({ configDir: sampleDir, clean: true });

            template.build(templateName, output, function (err) {
                assert.ok(fs.existsSync(foofile));
                assertSameFileContent(foofile, path.join(sampleDir, templateName, foo));

                assert.ok(fs.existsSync(bazfile));
                assertSameFileContent(bazfile, path.join(sampleDir, templateName, baz));

                assert.ok(fs.existsSync(quxfile));
                assertSameFileContent(quxfile, path.join(sampleDir, templateName, qux));

                assert.ok(fs.existsSync(existsFile1) === false);
                assert.ok(fs.existsSync(existsFile2) === false);

                done(err);
            });
        });
    });


    it('should raise error if source dirname is not exists.', function (done) {
        template.build("invalid", output, function (err) {
            if (err && err.message.match(/not exists/)) {
                done();
            } else {
                done(Error("not raise error"));
            }
        });
    });

    it('should raise error if source template path is configDir.', function (done) {
        template.build("..", output, function (err) {
            if (err && err.message.match(/invalid name/)) {
                done();
            } else {
                done(Error("not raise error"));
            }
        });
    });
});


describe('Dirtmpl#list with configDir', function () {
    var template;

    beforeEach(function() {
        template = dirtmpl({ configDir: sampleDir });
    });

    it('should get two templates', function(done) {
        template.list(function (err, results) {
            assert.equal(results.length, 2);
            assert.equal(results[0], "abc");
            assert.equal(results[1], "def");

            done(err);
        });
    });
});


describe('Dirtmpl#remove with configDir', function () {
    var name = "example" + Date.now();
    var configDir = temp.mkdirSync("dirtmpl_");

    var templateDirname = path.join(configDir, name);

    var template;

    beforeEach(function() {
        mkdirp.sync(templateDirname);
        template = dirtmpl({ configDir: configDir });
    });

    afterEach(function () {
        if (fs.existsSync(configDir)) {
            rimraf.sync(configDir);
        }
    });

    it('should remove a template directory.', function(done) {
        assert.ok(fs.existsSync(templateDirname) === true);

        template.remove(name, function (err) {
            assert.ok(fs.existsSync(templateDirname) === false);
            done(err);
        });
    });

    it('should raise error if target template path is configDir.', function (done) {
        template.remove("..", function (err) {
            if (err && err.message.match(/invalid name/)) {
                done();
            } else {
                done(Error("not raise error"));
            }
        });
    });
});
