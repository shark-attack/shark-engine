var Config = require('./src/utils/Config');
var cfg = new Config().load( __dirname + '/config.json');
module.exports = cfg;