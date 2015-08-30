var Config = require('./src/utils/Config');
var Logging = require('./src/utils/Logging');
var LogRead = require('./src/analytics/LogReader');
var ChannelPerformance = require('./src/analytics/ChannelPerformance');
var MediaFiles = require('./src/analytics/MediaFiles');
var cfg = new Config().load('config.json');

var cp = new ChannelPerformance(cfg);

/*var lr = new LogRead(cfg);
var file = lr.getFiles('verbose')[0];
var logs = lr.read(file.fullpath);

var f = lr.getFiles('verbose', lr.getFolders()[0] );
for (var c in f ) {
    var d = new Date();
    d.setTime(f[c].date);
}*/
