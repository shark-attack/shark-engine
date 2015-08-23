var Config = require('./src/utils/Config');
var Logging = require('./src/utils/Logging');

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
});
showbuilder.run(show, duration, cfg.libLocation);