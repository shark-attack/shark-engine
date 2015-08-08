var Config = require('./utils/Config');
var Logging = require('./utils/Logging');
var LogRead = require('./qos/LogReader');
var ChannelPerformance = require('./qos/ChannelPerformance')
var cfg = new Config().load('engine/config.json');

var cp = new ChannelPerformance(cfg);

/*var lr = new LogRead(cfg);
var file = lr.getFiles('verbose')[0];
var logs = lr.read(file.fullpath);

var f = lr.getFiles('verbose', lr.getFolders()[0] );
for (var c in f ) {
    var d = new Date();
    d.setTime(f[c].date);
}*/
