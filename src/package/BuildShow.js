var Queue = require( '../utils/Queue');
var File = require( '../utils/File');
var Playlist = require('./Playlist');
var GetMediaInfo = require('../utils/GetMediaInfo');
var events = require('events');
var util = require('util');
var fs = require('fs');
var path = require('path');
var rmdir = require('rimraf');
var VOCreation = require('./speech/WindowsPowerShellVOCreation');
var VOMixer = require('./VOMixer');

/**
 * Build Show
 * @param config
 * @constructor
 */
function BuildShow(config) {
    var self = this;

    if (config && config.log) {
        this.log = config.log;
    } else {
        this.log = function () {
        };
    }

    /** queue of things to do */
    var q = new Queue();

    /** assets to playlist */
    this.assets = [];

    /** show duration */
    this.duration = 0;

    /** show duration */
    this.showname = 0;

    /**
     * run through and discover media from our sources
     * @param show name
     * @param show length
     * @param sources
     */
    this.run = function(showname, len, data) {
        if (!showname) { showname = config.packaging.showName; }
        if (!len) { len = config.packaging.showDuration; }
        if (!data) { data = config.libLocation; }

        if (typeof data === "string") {
            data = JSON.parse(fs.readFileSync(data));
        }

        this.duration = len;
        this.showname = showname;
        var index = 0;
        data.sources.forEach( function (src) {
            src.assets.forEach( function(a) {
                if (a.duration) {
                    a.index = index ++; // keeping track of original order
                    q.add(a, function(asset, cb) {
                        // verify assets
                        new GetMediaInfo(asset, function (err) {
                            if (!err) {
                                a.sourcelabel = src.label;
                                self.assets.push(a);
                            }
                            cb();
                        }, config);
                    });
                }
            });
        });

        self.log("Build Show", "Building Show", { date: new Date(), level: "verbose" });

        rmdir(config.packaging.showLocation + path.sep + self.showname, function(error){
            if (error) {
                self.log("Build Show", "Could not remove files in " + config.packaging.showLocation + path.sep + self.showname, { date: new Date(), level: "error", error: error });
            } else {
                self.log("Build Show", "Removed all files in " + config.packaging.showLocation + path.sep + self.showname, { date: new Date(), level: "verbose" });
            }
        });
        q.run(self.onAssetsVerified);
    };

    /**
     * on assets verified
     */
    this.onAssetsVerified = function() {
        var orderbydate = self.assets.sort(function(a, b) {
            if (new Date(a.date).getTime() < new Date(b.date).getTime()) { return 1; }
            return -1;
        });

        // calculate how much time we need to cut
        var dur = 0;
        orderbydate.forEach( function(a) { dur += a.duration; });
        var deletetime = dur - self.duration;

        self.log("Build Show", "Removing overtime assets (" + Math.ceil(deletetime/60) + " minutes worth)", { date: new Date(), level: "verbose" });
        // delete all overtime assets
        while (deletetime > 0) {
            var del = orderbydate.pop();
            deletetime -= del.duration;
        }

        // reorder according to original order
        self.assets = orderbydate.sort(function(a, b) {
            if (a.index < b.index) { return 1; }
            return -1;
        });

        if (!fs.existsSync(config.packaging.showLocation)) {
            fs.mkdirSync(config.packaging.showLocation);
        }

        if (!fs.existsSync(config.packaging.showLocation + path.sep + self.showname)) {
            fs.mkdirSync(config.packaging.showLocation + path.sep + self.showname);
        }

        if (!fs.existsSync(config.packaging.showLocation + path.sep + self.showname + path.sep + 'tmp')) {
            fs.mkdirSync(config.packaging.showLocation + path.sep + self.showname + path.sep + 'tmp');
        }

        // add the show intro/outro
        if (config.packaging.showIntro) {
            var introVO = {
                "label": "intro VO",
                "filename": path.basename(config.packaging.showIntro),
                "mediaType": "mp3",
                "assetType": "audio",
                "sourceid": "vo",
                "source": "SharkAttack"
            };
            fs.writeFileSync(config.packaging.showLocation + path.sep + self.showname + path.sep + introVO.filename, fs.readFileSync(config.packaging.showIntro));
            self.assets.push(introVO);
        }
        self.assets = self.assets.reverse();

        self.pls = new Playlist(self.assets);

        self.log("Build Show", "Copying " + self.assets.length + " assets", { date: new Date(), level: "verbose" });

        self.assets.forEach( function(a) {
            var filename = a.filename;
            if (a.audioTranscodeFilename) { filename = a.audioTranscodeFilename; }

            var copyfrom = config.mediaDirectory + path.sep + a.sourceid + path.sep + filename; // assume discovered asset
            var copyto = config.packaging.showLocation + path.sep + self.showname + path.sep + filename;
            if (filename !== path.basename(filename)) { // is absolute path?
                copyfrom = filename;
                copyto = config.packaging.showLocation + path.sep + path.basename(filename)
            }

            fs.writeFileSync(copyto, fs.readFileSync(copyfrom));
        });
        self.createVoiceOvers();
    };

    /**
     * create vo's from playlist
     */
    this.createVoiceOvers = function() {
        q.stop();
        var vosongqueue = [];
        var vocount = 0;
        for (var c = 0; c < self.assets.length; c++ ) {
            var a = self.assets[c];
            if (a.sourceid !== 'vo') {
                if (vosongqueue.length == 0) {
                    vosongqueue.push({asset: a, intro: 'you just heard'});
                } else if (vosongqueue.length < 3) {
                    vosongqueue.push({asset: a, intro: 'and after that you heard'});
                } else {
                    vosongqueue.push({asset: a, intro: 'Next up is'});
                }

                if (c === self.assets.length - 1) {
                    vosongqueue[vosongqueue.length - 1].outtro = 'And thats it for the Shark Attack this week, thanks for joining us!';
                }

                if (vosongqueue.length > 3 || c === self.assets.length - 1) {
                    var playlistoffset = -1;
                    if (c === self.assets.length - 1) {
                        playlistoffset = 0;
                    }
                    q.add({ queue: vosongqueue, offset: playlistoffset }, function (opts, cb) {
                        vocount++;
                        self.createVO(cb, opts.queue, vocount, opts.offset);
                    });
                    vosongqueue = [];
                }
            }
        }

        q.run(function() {
            rmdir.sync(config.packaging.showLocation + path.sep + self.showname + path.sep + 'tmp');
            fs.writeFileSync(config.packaging.showLocation + path.sep + self.showname + path.sep + self.showname + '.html', self.pls.exportToHTML());
            fs.writeFileSync(config.packaging.showLocation + path.sep + self.showname + path.sep + self.showname + '.json', self.pls.exportToJSON());
            fs.writeFileSync(config.packaging.showLocation + path.sep + self.showname + path.sep + self.showname + '.m3u8', self.pls.exportToM3U8());
            self.emit(BuildShow.prototype.COMPLETE, self.pls);
        });
    };

    /**
     * sanitize to ensure TTS works
     * @param words
     * @returns {XML|string|void}
     */
    this.sanitize = function(words) {
        return words.replace(/[^a-z0-9]/gi,' ');
    };

    /**
     * create VO from asset queue
     * @param assetqueue
     * @param position in playlist offset
     */
    this.createVO = function(cb, assetqueue, id, positionInPlaylistOffset) {
        var txt = '';
        assetqueue = assetqueue.reverse();
        var item; // preserve last asset used for later as a ref to add to playlist
        while (assetqueue.length > 0) {
            item = assetqueue.pop();

            if (item.intro) {
                txt += VOCreation.SPEECHBREAK + this.sanitize(item.intro) + VOCreation.SPEECHBREAK;
            }

            if (item.asset) {
                if (item.asset.title && item.asset.artist) {
                    txt += this.sanitize(item.asset.title) + VOCreation.SPEECHBREAK + ' by ' + VOCreation.SPEECHBREAK + this.sanitize(item.asset.artist);
                } else if (item.asset.label && item.asset.label !== File.prototype.removeExtension(item.asset.filename)) {
                    txt += this.sanitize(item.asset.label);
                } else {
                    txt += 'something'
                }

                txt += VOCreation.SPEECHBREAK + ' found on ' + VOCreation.SPEECHBREAK + this.sanitize(item.asset.sourcelabel) + VOCreation.SPEECHBREAK;
            }

            if (item.outtro) {
                txt += VOCreation.SPEECHBREAK + this.sanitize(item.outtro) + VOCreation.SPEECHBREAK;
            }
        }

        var vo = new VOCreation(config);
        vo.create('en', txt, config.packaging.showLocation + path.sep + self.showname + path.sep + 'tmp' + path.sep + 'vo-block-' + id + '.' + VOCreation.OUTPUTFORMAT, function(err) {
            if(!err) {
                var mixer = new VOMixer(config);
                var opts = {
                    vo: config.packaging.showLocation + path.sep + self.showname + path.sep + 'tmp' + path.sep + 'vo-block-' + id + '.' + VOCreation.OUTPUTFORMAT,
                    bed: config.packaging.showVOBed,
                    fadeInDuration: config.packaging.voFadeInDuration,
                    fadeOutDuration: config.packaging.voFadeOutDuration,
                    voDelay: config.packaging.voDelay,
                    voEndPadding: config.packaging.voEndPadding,
                    outFileSampleRate: config.packaging.voOutFileSampleRate,
                    outfile: config.packaging.showLocation + path.sep + self.showname + path.sep + 'vo-block-' + id + '.mp3'
                };
                mixer.mix(opts, function(mixedasset) {
                    var voasset = {
                        'label': 'Song Recap VO',
                        'filename': 'vo-block-' + id + '.mp3',
                        'mediaType': 'mp3',
                        'assetType': 'audio',
                        'sourceid': 'vo',
                        'source': 'SharkAttack',
                        'duration': mixedasset.duration
                    };
                    self.log('Build Show', 'Add ' + 'vo-block-' + id + ' after ' + item.asset.label + ' with offset 1 '  , { date: new Date(), level: "verbose" });
                    self.pls.insertVOAfterAsset(voasset, item.asset, positionInPlaylistOffset);
                    cb();
                });
            }
        });
    };
}

util.inherits(BuildShow, events.EventEmitter);
BuildShow.prototype.COMPLETE = "BuildShowComplete";
exports = module.exports = BuildShow;
