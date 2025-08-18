"use strict";
const client = require("prom-client");
const config = require("./config");

client.collectDefaultMetrics({ prefix: config.metricsPrefix });

const requestCounter = new client.Counter({
  name: `${config.metricsPrefix}http_requests_total`,
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"]
});

module.exports = {
  metricsContentType: client.register.contentType,
  getMetrics: async () => {
    return client.register.metrics();
  },
  middleware: (req, res, next) => {
    const end = res.end;
    res.end = function (...args) {
      try {
        const route = req.route && req.route.path ? req.route.path : req.path || req.url;
        requestCounter.inc({ method: req.method, route: route, status: res.statusCode });
      } catch (e) {
        // ignore
      }
      end.apply(this, args);
    };

    next();
  }
};
