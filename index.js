var engine = {
    config: require('./config'),
    package: require('./package'),
    clean: require('./clean'),
    discover: require('./discover'),
    schedule: require('./schedule'),
    logging: require('./src/utils/Logging')
};

module.exports = engine;