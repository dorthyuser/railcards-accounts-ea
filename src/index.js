'use strict';

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
require('express-async-errors');
const bodyParser = require('body-parser');
const config = require('./config');
const logger = require('./logger');
const metrics = require('./metrics/metrics');
const accountsRouter = require('./routes/accounts');

const app = express();

app.use(helmet());
app.use(compression());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined', { stream: logger.stream }));

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Metrics
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metrics.registry.contentType);
    const metricsResponse = await metrics.registry.metrics();
    res.send(metricsResponse);
  } catch (err) {
    logger.error('Failed to collect metrics', err);
    res.status(500).send(err.message);
  }
});

// API routes
app.use('/accounts', accountsRouter);

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.message || 'Unhandled error', { err });
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const port = config.port || 3000;
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

module.exports = app;
