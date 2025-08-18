'use strict';

const salesforceService = require('../services/salesforceService');
const s3Service = require('../services/s3Service');
const logger = require('../logger');
const { v4: uuidv4 } = require('uuid');

// Example: get account by id
exports.getAccount = async (req, res) => {
  const id = req.params.id;
  logger.info('Fetching account %s', id);
  const account = await salesforceService.getAccountById(id);
  if (!account) return res.status(404).json({ error: 'Account not found' });
  res.json(account);
};

// Example: create account
exports.createAccount = async (req, res) => {
  const payload = req.body || {};
  // Simple validation
  if (!payload.name) return res.status(400).json({ error: 'name is required' });

  const id = uuidv4();
  const record = {
    ExternalId__c: id,
    Name: payload.name,
    Email__c: payload.email || null,
    AdditionalData__c: JSON.stringify(payload.metadata || {})
  };

  const created = await salesforceService.createAccount(record);

  // Optionally persist a copy to S3
  if (s3Service && payload.backup === true) {
    const key = `accounts/${id}.json`;
    await s3Service.putObject(key, Buffer.from(JSON.stringify(created)), 'application/json');
  }

  res.status(201).json({ id, createdAt: new Date().toISOString(), sfId: created && created.id });
};

exports.updateAccount = async (req, res) => {
  const id = req.params.id;
  const payload = req.body || {};
  const updated = await salesforceService.updateAccountByExternalId(id, payload);
  if (!updated) return res.status(404).json({ error: 'Account not found' });
  res.json({ updated: true });
};

exports.deleteAccount = async (req, res) => {
  const id = req.params.id;
  const deleted = await salesforceService.deleteAccountByExternalId(id);
  if (!deleted) return res.status(404).json({ error: 'Account not found' });
  res.json({ deleted: true });
};
