var Config = require('./src/utils/Config');
var Logging = require('./src/utils/Logging');
var zipdir = require('zip-dir');
var path = require('path');

var cfg = new Config().load('config.json');
Logging.applyConfig(cfg);

var starttime = new Date();
var BuildShow = require('./src/package/BuildShow.js');
var showbuilder = new BuildShow(cfg);

showbuilder.on(BuildShow.prototype.COMPLETE, function(stats) {
    cfg.log("SharkAttack", "Show " + cfg.packaging.showName + " created" );
    Logging.recordTaskRun( { start: starttime, end: new Date(), name: 'packaging', details: 'Show ' + cfg.packaging.showName + ' created' } );

    if (cfg.packaging.compress === true) {
        zipdir( cfg.packaging.showLocation + path.sep + cfg.packaging.showName, { saveTo: cfg.packaging.showLocation + path.sep + cfg.packaging.showName + '.zip' }, function (err, buffer) {
            cfg.log("SharkAttack", "Show " + cfg.packaging.showName + " zipped" );
            Logging.recordTaskRun( { start: starttime, end: new Date(), name: 'packaging', details: 'Show ' + cfg.packaging.showName + ' zipped' } );
        });
    }
});
module.exports = showbuilder;