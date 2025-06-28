const express = require('express');
const router = express.Router();
const dataController = require('../controllers/data.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/initial', authMiddleware, dataController.getInitialData);

module.exports = router;
