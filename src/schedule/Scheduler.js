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
            self.createTask(c);
            self.scheduleTask(c);
        }
    };

    /**
     * schedule or reschedule a task
     * @param task
     */
    this.scheduleTask = function(task) {
        var tskobj = this.findTask(task);
        if (!tskobj) { tskobj = self.createTask(); }

        var sched = later.parse.text(config.schedule[task]);
        config.log('Schedule', 'Next run of '  + task + ' scheduled for ' + later.schedule(sched).next(0), { date: new Date(), level: "verbose" });
        tskobj.timer = function(task) {
            later.setTimeout(function() {
                self.emit(this.RUN_TASK, task);
                self.scheduleTask(task);
            }, sched);
        };
        tskobj.timerID = tskobj.timer(task);
    };

    /**
     * create or refresh task
     * @param task
     */
    this.createTask = function(task) {
        var newtask = {
            task: task,
            schedule: config.schedule[task],
            timer: null,
            timerID: null
        };
        self.tasks.push(newtask);
    };

    /**
     * find a task
     * @param task
     * @returns {*}
     */
    this.findTask = function(task) {
        for (var c = 0; c < self.tasks.length; c++) {
            if (self.tasks[c].task === task) {
                return self.tasks[c];
            }
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
