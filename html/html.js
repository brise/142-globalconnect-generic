var fs = require("fs"),
    path = require("path"),
    UglifyJS = require("uglify-js"),
    crypto = require("crypto");

var cwd = path.resolve(__dirname + '/../');

var layers = [];

/**
 * Read commonly used files, combine into stacked compilations later.
 * ---------------------------------------------------------------------------------------------------------------------
 */

console.log("Analysing HTML structure ...");

var
    files = {
        body: fs.readFileSync(cwd + "/html/body.html", "utf8")
    };

fs.readdir(cwd + '/html/layers', (err, files) => {

    files.forEach(async file => {
        layers.push(file.split('.')[0]);
    });

    tryCombineFiles();

});

var

    replaceFileData = function (file_data, search, replace) {

        file_data = file_data.split(search).join(replace);

        return file_data;
    },

    replaceLayers = function (file_data) {

        layers.forEach(async (key) => {
            if (files[key]) {
                file_data = replaceFileData(file_data, '<' + key + '></' + key + '>', files[key]);
            }
        });

        return file_data;
    },

    replaceAll = function (file_data) {

        file_data = replaceLayers(replaceLayers(file_data));

        return file_data;
    },

    tryCombineFiles = function () {

        if (layers.length > 0) {

            // console.log(elements.length, settings.length, groups.length, components.length);
            console.log("HTML structure analysis complete, reading files ...");

            layers.forEach(async (key) => {
                try {

                    files[key] = fs.readFileSync(cwd + '/html/layers/' + key + '.html', 'utf8')

                } catch (e) {
                    console.log('Error: Unable to read file "' + key + '.html".');
                }
            });

            console.log("HTML file read complete, combining files ...");

            fs.writeFileSync(
                cwd + "/banner.html", replaceAll(files.body)
            );

            console.log("HTML file combination complete.");

        }

    };
