var Config = require('./src/utils/Config');
var Logging = require('./src/utils/Logging');

var cfg = new Config().load('./config.json');
Logging.applyConfig(cfg);

var starttime = new Date();
var Discover = require('./src/discover/Discover.js');
var discover = new Discover(cfg);
discover.on(Discover.prototype.COMPLETE, function(lib, stats) {
    cfg.log("SharkAttack", "Discovery Finished");
    Logging.recordTaskRun( { start: starttime, end: new Date(), name: 'discovery', details: stats.totalAssets + ' assets found' } );

});
module.exports = discover;