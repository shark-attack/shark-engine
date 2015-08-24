var task = process.argv[2];
console.log(task)

switch (task) {
    case 'package':
        var pkg = require('./package');
        pkg.run();
        break;

    case 'discover':
        var disc = require('./discover');
        disc.run();
        break;

    case 'clean':
        var clean = require('./clean');
        clean.run();
        break;

    case 'schedule':
        var schedule = require('./schedule');
        schedule.run();
        break;
}
