var fs = require('fs');
var events = require('events');
var util = require('util');
var later = require('later');
later.date.localTime();

/**
 * Scheduler task
 * @param config
 * @param timer frequency (seconds)
 * @constructor
 */
function Scheduler(config) {
    var self = this;

    /** upcoming later tasks */
    this.tasks = [];

    /**
     * c-tor
     */
    this.init = function() {};

    /**
     * run scheduler
     */
    this.run = function() {
        for (var c in config.schedule ) {
            var sched = later.parse.text(config.schedule[c]);
            config.log('Schedule', 'Next run of '  + c + ' scheduled for ' + later.schedule(sched).next(1), { date: new Date(), level: "verbose" });

            var newtask = {
                task: c,
                schedule: sched,
                timer: function(task) { later.setTimeout(function() { self.emit(this.RUN_TASK, task); }, sched) },
                timerID: null
            };
            newtask.timerID = newtask.timer(c);
            this.tasks.push(newtask);
        }
    };

    /**
     * clear scheduled tasks
     */
    this.clearTasks = function() {
        for (var c in this.tasks) {
            clearTimeout(this.tasks[c].timerID);
        }
        this.tasks = [];

    };

    this.init();
}

Scheduler.prototype.RUN_TASK = 'runtask';
util.inherits(Scheduler, events.EventEmitter);

exports = module.exports = Scheduler;
