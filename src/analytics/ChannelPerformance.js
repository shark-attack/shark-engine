var fs = require('fs');
var path = require('path');
var File = require('../utils/File');
var Database = require('../utils/Database');

var ChannelPerformance = function(cfg) {

    /** channels */
    this.channels = {};

    /** database connector */
    this.db = new Database(cfg);

    /** channels definition */
    this.channelsSource;

    /**
     * c-tor
     */
    this.init = function() {
        var tables = this.db.getAllTables('assets' + path.sep + 'discovered');
        this.db.connectSync(tables[0]);
        for (var c in tables) {
            this.db.connectSync(tables[c]);

            var channel = tables[c].split('assets' + path.sep + 'discovered'  + path.sep)[1];
            if (!this.channels[channel]) {
                this.channels[channel] = { timestamps: [] };
            }
            var keys = this.db.keys();
            var earliest, latest;
            for (var c in keys) {
                var date = new Date(this.db.find(keys[c]).date).getTime();
                if (!earliest || date < earliest) { earliest = date; }
                if (!latest || date > latest) { latest = date; }
                this.channels[channel].timestamps.push(date);
            }
            this.channels[channel].timestamps = this.channels[channel].timestamps.sort();
            this.channels[channel].starttime = earliest;
            this.channels[channel].endtime = latest;
            this.channels[channel].daysactive = (latest-earliest) / (1000 * 60 * 60 * 24);
            this.channels[channel].assetsperday = this.channels[channel].timestamps.length / this.channels[channel].daysactive;
            this.channels[channel].label = this.getDisplayName(channel);
        }

        File.prototype.ensureDirectoriesExist(cfg.analytics.root);
        fs.writeFileSync(cfg.analytics.channelfrequency, JSON.stringify(this.channels, null, 2));
    };

    /**
     * get display name from ID
     */
    this.getDisplayName = function(id) {
        if (!this.channelsSource) {
            this.channelsSource = JSON.parse(fs.readFileSync(cfg.sourcefeed));
        }

        for (var c in this.channelsSource.sources) {
            if (this.channelsSource.sources[c].id === id) {
                return this.channelsSource.sources[c].label;
            }
        }
        return '';
    };

    this.init();

};

exports = module.exports = ChannelPerformance;