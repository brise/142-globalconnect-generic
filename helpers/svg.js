var fs = require("fs"),
    path = require("path");

var cwd = path.resolve(__dirname + '/../');

var files = [];

/**
 * Read commonly used files, combine into stacked compilations later.
 * ---------------------------------------------------------------------------------------------------------------------
 */

var createJsFromSvg = function (path, file, name) {

    fs.writeFileSync(
        path + "/" + name + ".js", "window.tactic.assets." + name + " = '" + file + "'"
    );

    console.log("File '" + path + "/" + name + ".svg' converted to object.");

}

var lookForSvg = function (path) {

    fs.readdir(path, (err, files) => {

        files.forEach(async file => {

            var name_split = file.split('.');

            if (name_split[name_split.length - 1] === 'svg') {

                createJsFromSvg(path, fs.readFileSync(path + '/' + file, 'utf8'), name_split[0]);

            }

        });

    });

}

console.log("Looking for SVG files ...");

lookForSvg(cwd + '/assets');
lookForSvg(cwd + '/assets/logos');