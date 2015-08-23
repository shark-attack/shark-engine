var walk = require('walk');

/**
 * media files
 * @param cfg
 * @constructor
 */
var MediaFiles = function(cfg) {
    this.list = function(cb, channel) {
        var channels = {};
        walker = walk.walk(engine.config.mediaDirectory);
        walker.on('file', function (root, fileStats, next) {
            var pth = root.split(path.sep);
            var channelname = pth[pth.length - 1];
            if (channel && channelname !== channel )  {
                next();
                return;
            }
            if (!channels[channelname]) {
                channels[channelname] = [];
            }
            channels[channelname].push(fileStats.name);
            next();
        });
        walker.on('end', function () { cb.apply(this, [channels]); });
    }
};

module.exports = MediaFiles;