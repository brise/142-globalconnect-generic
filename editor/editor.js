var fs = require("fs"),
    path = require("path"),
    UglifyJS = require("uglify-js"),
    crypto = require("crypto");

var cwd = path.resolve(__dirname + '/../');

var elements = [],
    settings = [],
    groups = [],
    components = [],
    options = [],
    macros = [];

/**
 * Read commonly used files, combine into stacked compilations later.
 * ---------------------------------------------------------------------------------------------------------------------
 */

console.log("Analysing editor structure ...");

var
    files = {
        config: fs.readFileSync(cwd + "/editor/config.html", "utf8"),
        dict: fs.readFileSync(cwd + "/editor/dict.html", "utf8"),
        body: fs.readFileSync(cwd + "/editor/body.html", "utf8")
    };

fs.readdir(cwd + '/editor/elements', (err, files) => {

    files.forEach(async file => {
        elements.push(file.split('.')[0]);
    });

    tryCombineFiles();

});

fs.readdir(cwd + '/editor/settings', (err, files) => {

    files.forEach(async file => {
        settings.push(file.split('.')[0]);
    });

    tryCombineFiles();

});

fs.readdir(cwd + '/editor/groups', (err, files) => {

    files.forEach(async file => {
        groups.push(file.split('.')[0]);
    });

    tryCombineFiles();

});

fs.readdir(cwd + '/editor/components', (err, files) => {

    files.forEach(async file => {
        components.push(file.split('.')[0]);
    });

    tryCombineFiles();

});

fs.readdir(cwd + '/editor/options', (err, files) => {

    files.forEach(async file => {
        options.push(file.split('.')[0]);
    });

    tryCombineFiles();

});

fs.readdir(cwd + '/editor/macros', (err, files) => {

    files.forEach(async file => {
        macros.push(file.split('.')[0]);
    });

    tryCombineFiles();

});

var

    replaceFileData = function (file_data, search, replace) {

        file_data = file_data.split(search).join(replace);

        return file_data;
    },

    replaceComponents = function (file_data) {

        components.forEach(async (key) => {
            if (files[key]) {
                file_data = replaceFileData(file_data, '<' + key + '></' + key + '>', files[key]);
            }
        });

        return file_data;
    },

    replaceGroups = function (file_data) {

        groups.forEach(async (key) => {
            if (files[key]) {
                file_data = replaceFileData(file_data, '<' + key + '></' + key + '>', files[key]);
            }
        });

        return file_data;
    },

    replaceSettings = function (file_data) {

        settings.forEach(async (key) => {
            if (files[key]) {
                file_data = replaceFileData(file_data, '<' + key + '></' + key + '>', files[key]);
            }
        });

        return file_data;
    },

    replaceElements = function (file_data) {

        elements.forEach(async (key) => {
            if (files[key]) {
                file_data = replaceFileData(file_data, '<' + key + '></' + key + '>', files[key]);
            }
        });

        return file_data;
    },

    replaceSelectors = function (file_data) {

        options.forEach(async (key) => {
            if (files[key]) {
                file_data = replaceFileData(file_data, '<' + key + '></' + key + '>', files[key]);
            }
        });

        return file_data;
    },

    replaceMacros = function (file_data) {

        macros.forEach(async (key) => {
            if (files[key]) {
                file_data = replaceFileData(file_data, '<' + key + '></' + key + '>', files[key]);
            }
        });

        return file_data;
    },

    replaceAll = function (file_data) {

        file_data = replaceComponents(replaceMacros(replaceSelectors(replaceGroups(replaceSettings(replaceElements(replaceComponents(replaceGroups(replaceElements(file_data)))))))));

        return file_data;
    },

    tryCombineFiles = function () {

        if (elements.length > 0 && settings.length > 0 && groups.length > 0 && components.length > 0 && options.length > 0 && macros.length > 0) {

            // console.log(elements.length, settings.length, groups.length, components.length);
            console.log("Editor structure analysis complete, reading files ...");

            elements.forEach(async (key) => {
                try {

                    files[key] = fs.readFileSync(cwd + '/editor/elements/' + key + '.html', 'utf8')

                } catch (e) {
                    console.log('Error: Unable to read file "' + key + '.html".');
                }
            });

            settings.forEach(async (key) => {
                try {

                    files[key] = fs.readFileSync(cwd + '/editor/settings/' + key + '.html', 'utf8')

                } catch (e) {
                    console.log('Error: Unable to read file "' + key + '.html".');
                }
            });

            groups.forEach(async (key) => {
                try {

                    files[key] = fs.readFileSync(cwd + '/editor/groups/' + key + '.html', 'utf8')

                } catch (e) {
                    console.log('Error: Unable to read file "' + key + '.html".');
                }
            });

            components.forEach(async (key) => {
                try {

                    files[key] = fs.readFileSync(cwd + '/editor/components/' + key + '.html', 'utf8')

                } catch (e) {
                    console.log('Error: Unable to read file "' + key + '.html".');
                }
            });

            options.forEach(async (key) => {
                try {

                    files[key] = fs.readFileSync(cwd + '/editor/options/' + key + '.html', 'utf8')

                } catch (e) {
                    console.log('Error: Unable to read file "' + key + '.html".');
                }
            });

            macros.forEach(async (key) => {
                try {

                    files[key] = fs.readFileSync(cwd + '/editor/macros/' + key + '.html', 'utf8')

                } catch (e) {
                    console.log('Error: Unable to read file "' + key + '.html".');
                }
            });

            console.log("Editor file read complete, combining files ...");

            fs.writeFileSync(
                cwd + "/editor.html", replaceAll(files.body) + files.config + files.dict
            );

            console.log("Editor file combination complete.");

        }

    };
