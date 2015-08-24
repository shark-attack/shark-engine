var Config = require('./src/utils/Config');
var Logging = require('./src/utils/Logging');
var rimraf = require('rimraf');

var cfg = new Config().load('./config.json');
cfg.log = Logging.console;
Logging.config = cfg;

var starttime = new Date();
var Clean = require('./src/clean/Clean.js');
var clean = new Clean(cfg);
clean.on(Clean.prototype.COMPLETE, function(deleted) {
    cfg.log("SharkAttack", "Cleanup Finished");
    Logging.recordTaskRun( { start: starttime, end: new Date(), name: 'packaging', details: deleted.length + ' files deleted' } );

    if (cfg.cleaning.cleanAllShows) {
        rimraf(cfg.packaging.showLocation, null);
    }
});

module.exports = clean;