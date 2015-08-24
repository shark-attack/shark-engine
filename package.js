var Config = require('./src/utils/Config');
var Logging = require('./src/utils/Logging');
var zipdir = require('zip-dir');
var path = require('path');

var cfg = new Config().load('config.json');
cfg.log = Logging.console;
Logging.config = cfg;

var starttime = new Date();
var BuildShow = require('./src/package/BuildShow.js');
var showbuilder = new BuildShow(cfg);

var show = process.argv[2] || 'SAShow';
var duration = parseInt(process.argv[3]) || 5400;

showbuilder.on(BuildShow.prototype.COMPLETE, function(stats) {
    cfg.log("SharkAttack", "Show " + show + " created" );
    Logging.recordTaskRun( { start: starttime, end: new Date(), name: 'packaging', details: 'Show ' + show + ' created' } );

    if (cfg.packaging.compress === true) {
        zipdir( cfg.packaging.showLocation + path.sep + show, { saveTo: cfg.packaging.showLocation + path.sep + show + '.zip' }, function (err, buffer) {
            cfg.log("SharkAttack", "Show " + show + " zipped" );
            Logging.recordTaskRun( { start: starttime, end: new Date(), name: 'packaging', details: 'Show ' + show + ' zipped' } );
        });
    }
});
showbuilder.run(show, duration, cfg.libLocation);