var fs = require("fs"),
    util = require('util'),
    spawn = require('child_process').spawn,
    events = require("events"),
    path = require('path'),
    split = require('event-stream').split,
    FileUtils = require('../../../utils/File.js');

/**
 * youtube downloaders - in the configuration, there are several formats to try to find
 * we try to get the first one we can based on our priorities
 * @constructor
 */
function YouTubeDownloader(asset, cb, cfg) {

    var self = this;

    /** filename that youtube-dl uses */
    self.downloadfilename = "";

    if ( cfg && cfg.logging ) {
        this.logging = cfg.logging;
    } else {
        this.logging = function(){};
    }

    /** youtube downloaders task */
    this._downloader = null;


    /**
     * line output handler
     * @param data
     * @private
     */
    this._onLineOutput = function(data) {
        if (data.indexOf("[download] Destination: ") != -1) {
            // found destination file
            self.downloadfilename = data.substr("[download] Destination: ".length, data.length);
            self.logging("Youtube Download", "Destination file found: " + asset.filename, { date: new Date(), level: "verbose", asset: asset });

        }
        self.logging("Youtube Download", data.toString(), { date: new Date(), level: "verbose", asset: asset });
    }

    /**
     * on error handler
     * @param err
     * @private
     */
    this._onErrorData = function(err) {
        self.logging("Youtube Download", err.toString(), { date: new Date(), level: "error", asset: asset });
        cb(err);
    }

    /**
     * on error handler
     * @param err
     * @private
     */
    this._onError = function(err) {
        self.logging("Youtube Download", "Please be sure to have youtube-dl installed on your machine and in your path " + err.toString(), { date: new Date(), level: "error", asset: asset });
        cb(err);
    }

    /**
     * on complete handler
     * @param data
     * @private
     */
    this._onComplete = function(data) {
        // rename file to something thats expected by the original input (we can't get filenames all the time if we skip downloads when file exists)
        var ext = FileUtils.prototype.getExtension(self.downloadfilename);
        fs.renameSync(cfg.mediaDirectory + path.sep + self.downloadfilename, cfg.mediaDirectory + path.sep + asset.filename + "." + ext);
        asset.filename = asset.filename + "." + ext;
        self.logging("Youtube Download", "Complete " + asset.filename, { date: new Date(), level: "verbose", asset: asset });
        cb();
    }

    /**
     * check if file does exist
     * @param outputdir
     * @param filename
     * @return {Boolean}
     * @private
     */
    this._doesExist = function(outputdir, filename) {
        if (FileUtils.prototype.doesExist(outputdir + path.sep + filename + ".mp4")) { return filename + ".mp4"; }
        if (FileUtils.prototype.doesExist(outputdir + path.sep + filename + ".flv")) { return filename + ".flv"; }
        if (FileUtils.prototype.doesExist(outputdir + path.sep + filename + ".webm")) { return filename + ".webm"; }
        if (FileUtils.prototype.doesExist(outputdir + path.sep + filename + ".mp3")) { return "mp3"; }
        return "";
    }


    var existsAs = this._doesExist(cfg.mediaDirectory, asset.filename);
    if ( existsAs === "") {
        this._downloader = null;
        this._downloader = spawn("youtube-dl",[asset.media], { cwd: cfg.mediaDirectory }).on('error', this._onError);
        this._downloader.stderr.on('data', this._onErrorData);
        this._downloader.on('exit', this._onComplete);
        this._downloader.stdout.setEncoding('utf8');
        var line = new split();
        this._downloader.stdout.pipe(line);
        line.on('data', this._onLineOutput);

        this.logging("Youtube Download", "Now Downloading " + asset.media, { date: new Date(), level: "verbose", asset: asset });
    } else {
        asset.filename = existsAs;
        this.logging("Youtube Download", "File exists - " + asset.media, { date: new Date(), level: "verbose", asset: asset });
        cb();
    }
}

exports = module.exports = YouTubeDownloader;