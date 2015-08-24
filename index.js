var engine = {
    config: require('./config'),
    packaging: reqiure('./package'),
    clean: require('./clean'),
    discover: require('./discover'),
    schedule: require('./schedule')
};

module.exports = engine;