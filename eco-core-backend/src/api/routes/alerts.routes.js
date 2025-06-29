const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alerts.controller');

router.get('/critical', alertsController.getCriticalAlerts);

module.exports = router; 