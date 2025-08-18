'use strict';

const client = require('prom-client');
const registry = new client.Registry();

client.collectDefaultMetrics({ register: registry });

// Application custom metrics can be registered here

module.exports = { client, registry };
