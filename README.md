# railcards-accounts-ea Node.js Migration

This repository contains a Node.js migration scaffold of the original MuleSoft "railcards-accounts-ea" project.

Key features included in the migration:
- Express-based HTTP API server
- Salesforce integration (via jsforce)
- AWS S3 integration (via aws-sdk)
- Basic metrics endpoint (/metrics) using prom-client
- Logging using winston
- Example routes and controllers for accounts

Getting started:
1. Copy .env.example to .env and populate values.
2. npm install
3. npm run dev

Endpoints:
- GET /health
- GET /metrics
- GET /accounts/:id
- POST /accounts

Notes:
- This is a recommended starting point for migration. Mapper logic and flows from Mule should be implemented in controllers and services.
