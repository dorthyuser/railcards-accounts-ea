"use strict";
const express = require("express");
const router = express.Router();
const uuid = require("uuid");
const salesforceService = require("../services/salesforceService");
const s3Service = require("../services/s3Service");
const metrics = require("../metrics");

// Attach metrics middleware for these routes
router.use(metrics.middleware);

// Example: GET /accounts/:id -> fetch account from Salesforce
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const account = await salesforceService.getAccountById(id);
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.json({ data: account });
  } catch (err) {
    next(err);
  }
});

// Example: POST /accounts -> create account (store payload in S3 and create in Salesforce)
router.post("/", async (req, res, next) => {
  try {
    const payload = req.body || {};
    const id = uuid.v4();

    // Persist raw payload to S3 for audit/archival similar to Mule S3 connector usage
    const s3Key = `accounts/${new Date().toISOString().slice(0,10)}/${id}.json`;
    await s3Service.uploadJSON(s3Key, payload);

    // Create in Salesforce
    const created = await salesforceService.createAccount(Object.assign({}, payload, { External_Id__c: id }));

    res.status(201).json({ id: created.id || id, s3Key, salesforce: created });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
