var Config = require('./src/utils/Config');
var Scheduler = require('./src/schedule/Scheduler');
var Logging = require('./src/utils/Logging');

var cfg = new Config().load('./config.json');
Logging.applyConfig(cfg);

var schedule = new Scheduler(cfg);
schedule.on(Scheduler.RUN_TASK, function(task) {
    var starttime = new Date();
    switch(task) {
        case 'discovery':
            var discover = require('./discover');
            discover.run();
            break;

        case 'packaging':
            var pkg = require('./package');
            pkg.run();
            break;

        case 'cleaning':
            var clean = require('./clean');
            clean.run();
            break;
    }
});

module.exports = schedule;