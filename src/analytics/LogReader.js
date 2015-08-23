var fs = require('fs');
var File = require('../utils/File');

/**
 * loag reader
 * @constructor
 */
function LogReader(cfg) {

    /**
     * read a log file
     * @param file
     * @returns {Array}
     */
    this.read = function(file) {
        var f = fs.readFileSync(file, 'utf8');
        var logstext = f.split('\n');

        var logs = [];
        for (var c in logstext) {
            if (logstext[c] !== '') {
                logstext[c] = logstext[c].split('\t');
                var log = {date: logstext[c][0], type: logstext[c][1], message: logstext[c][2]};
                logs.push(log);
            }
        }
        return logs;
    };

    /**
     * get log folders
     * @returns {*}
     */
    this.getFolders = function() {
        var logfolders = File.prototype.getAllFolders(cfg.logging.root, {
            map:
                function(path, foldername, dir) {
                    var f = foldername.split('-');
                    return { fullpath: path, foldername: foldername, directory: dir, month: f[1], year: f[0] };
                }
        });
        return logfolders;
    };

    /**
     * get log files
     * @param {String} type
     * @param {String} folder
     * @returns {*|Array}
     */
    this.getFiles = function(type, folder) {
        if (!type) { type = 'all'; }
        if (!folder) { folder = cfg.logging.root; }
        var logfiles = File.prototype.getAllFiles(cfg.logging.root, {
            map:
                function(path, filename, dir) {
                    var f = filename.split('-');
                    var type = 'none';
                    if (f[2]) { type = f[2].split('.')[0]; }
                    var d = new Date();
                    d.setTime(f[0]);
                    return { fullpath: path, filename: filename, directory: dir, date:d, origin:f[1], type: type };
                },
            filter:
                function(file) {
                    if (file.type === type || type === 'all') { return false} else { return true; }
                }
            }
        );
        return logfiles;
    }
}

exports = module.exports = LogReader;