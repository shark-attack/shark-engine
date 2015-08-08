var fs = require('fs');
var path = require('path');
var File = require('../utils/File');
var Database = require('../utils/Database');

var ChannelPerformance = function(cfg) {

    /** channels */
    this.channels = {};

    /** database connector */
    this.db = new Database(cfg);

    /**
     * c-tor
     */
    this.init = function() {
        var tables = this.db.getAllTables('assets' + path.sep + 'discovered');
        for (var c in tables) {
            this.db.connectSync(tables[c]);
            var channel = tables[c].split('assets' + path.sep + 'discovered'  + path.sep)[1];
            if (!this.channels[channel]) {
                this.channels[channel] = [];
            }
            var keys = this.db.keys();
            for (var c in keys) {
                var date = new Date(this.db.find(keys[c]).date).getTime();
                this.channels[channel].push(date);
            }
        }

        for (var d in this.channels) {
            this.channels[d].sort();
        }

        File.prototype.ensureDirectoriesExist(cfg.analytics.root);
        fs.writeFileSync(cfg.analytics.channelfrequency, JSON.stringify(this.channels, null, 2));
    };


    this.init();

};

exports = module.exports = ChannelPerformance;