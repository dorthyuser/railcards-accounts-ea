'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/accountsController');

// GET /accounts/:id
router.get('/:id', controller.getAccount);

// POST /accounts
router.post('/', controller.createAccount);

// PUT /accounts/:id
router.put('/:id', controller.updateAccount);

// DELETE /accounts/:id
router.delete('/:id', controller.deleteAccount);

module.exports = router;
