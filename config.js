var File = require('./src/utils/File');
var Config = require('./src/utils/Config');
var cfg = new Config().load('./config.json');
module.exports = cfg;
