var File = require('./src/utils/File');
var Config = require('./src/utils/Config');
var cfg = new Config().load( __dirname + '/config.json');

File.prototype.ensureDirectoriesExist([cfg.applicationStorage, cfg.mediaDirectory]);
module.exports = cfg;
