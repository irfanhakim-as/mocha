const core = require('./filters.core');
const node = require('./filters.node');

module.exports = {
    ...core,
    ...node
};
