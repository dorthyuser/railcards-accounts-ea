'use strict';

const jsforce = require('jsforce');
const config = require('../config');
const logger = require('../logger');

let conn = null;

async function connect() {
  if (conn) return conn;
  if (!config.features.useSalesforce) {
    logger.warn('Salesforce integration disabled via feature flag. Using in-memory mock.');
    conn = { mock: true };
    return conn;
  }

  const username = config.salesforce.username;
  const password = config.salesforce.password;
  if (!username || !password) throw new Error('Salesforce credentials are not configured');

  conn = new jsforce.Connection({ loginUrl: config.salesforce.loginUrl });
  try {
    await conn.login(username, password + (config.salesforce.token || ''));
    logger.info('Connected to Salesforce');
    return conn;
  } catch (err) {
    logger.error('Salesforce connection failed', err);
    // fallback to mock to avoid total outage
    conn = { mock: true };
    return conn;
  }
}

async function getAccountById(id) {
  const c = await connect();
  if (c.mock) {
    // Return a stubbed account
    return { id, name: 'Mock Account', externalId: id };
  }
  // Query by external id or Salesforce Id
  try {
    const q = `SELECT Id, Name, Email__c, ExternalId__c, AdditionalData__c FROM Account WHERE ExternalId__c='${id}' LIMIT 1`;
    const result = await c.query(q);
    return result.records && result.records.length ? result.records[0] : null;
  } catch (err) {
    logger.error('Salesforce query failed', err);
    throw err;
  }
}

async function createAccount(record) {
  const c = await connect();
  if (c.mock) {
    return { id: `mock_${Date.now()}`, ...record };
  }
  try {
    const result = await c.sobject('Account').create(record);
    return result;
  } catch (err) {
    logger.error('Salesforce create failed', err);
    throw err;
  }
}

async function updateAccountByExternalId(externalId, fields) {
  const c = await connect();
  if (c.mock) return true;
  try {
    // Find record Id
    const q = `SELECT Id FROM Account WHERE ExternalId__c='${externalId}' LIMIT 1`;
    const res = await c.query(q);
    if (!res.records || res.records.length === 0) return false;
    const sfId = res.records[0].Id;
    await c.sobject('Account').update({ Id: sfId, ...fields });
    return true;
  } catch (err) {
    logger.error('Salesforce update failed', err);
    throw err;
  }
}

async function deleteAccountByExternalId(externalId) {
  const c = await connect();
  if (c.mock) return true;
  try {
    const q = `SELECT Id FROM Account WHERE ExternalId__c='${externalId}' LIMIT 1`;
    const res = await c.query(q);
    if (!res.records || res.records.length === 0) return false;
    const sfId = res.records[0].Id;
    await c.sobject('Account').destroy(sfId);
    return true;
  } catch (err) {
    logger.error('Salesforce delete failed', err);
    throw err;
  }
}

module.exports = {
  getAccountById,
  createAccount,
  updateAccountByExternalId,
  deleteAccountByExternalId
};
