'use strict';

const winston = require('winston');
const config = require('./config');

const logger = winston.createLogger({
  level: config.logLevel || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'railcards-accounts-ea' },
  transports: [new winston.transports.Console()]
});

// morgan stream
logger.stream = {
  write: function (message) {
    logger.info(message.trim());
  }
};

module.exports = logger;
