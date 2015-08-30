var ffdb = require('flat-file-db');
var events = require('events');
var util = require('util');
var File = require('../utils/File');
var path = require('path');

function Database(config) {
    var self = this;

    /** db instance */
    this.db;

    /**
     * connect to db
     * @param table
     */
    this.connect = function(table) {
        db = new ffdb( config.dbLocation + path.sep + table + '.db' );

        db.on('open', function(){
            self.emit(Database.prototype.CONNECTED);
        });
    };

    /**
     * connect to db (sync)
     * @param table
     */
    this.connectSync = function(table) {
        db = new ffdb.sync( config.dbLocation + path.sep + table + '.db' );
    };

    /**
     * insert doc into DB
     * @param key
     * @param value
     * @param callback
     */
    this.insert = function(key, val, cb) {
        db.put(key, val, function(err) {
            if (cb) { cb(err); }
        });
    };

    /**
     * get keys
     * @returns {*}
     */
    this.keys = function() {
        return db.keys();
    };

    /**
     * find doc
     * @param query
     * @returns {*}
     */
    this.find = function(query) {
        return db.get(query);
    };

    /**
     * get all tables
     * @param {String} optional dir in db location to narrow down location
     */
    this.getAllTables = function(dir) {
        var dbdir = config.dbLocation;
        if (dir) {
            dbdir += path.sep + dir;
        }
        var files = File.prototype.getAllFiles(dbdir, {
            map: function(fullpath, filename, dir) {
                var table = fullpath.split(config.dbLocation + path.sep)[1];
                var db = File.prototype.removeExtension(table);
                return db;
            }
        });
        return files;
    };
}

util.inherits(Database, events.EventEmitter);
Database.prototype.CONNECTED = "connected";
Database.prototype.CONNECTIONERROR = "connectionerror";
exports = module.exports = Database;