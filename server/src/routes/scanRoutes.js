const express = require('express');
const router = express.Router();
const { handleDomainScan } = require('../controllers/scanController');
const { getHistory } = require('../controllers/historyController');
const { optionalAuth, requireAuth } = require('../middlewares/authMiddleware');

/**
 * @route POST /api/scan/audit
 * @desc  Audits domain for MX, SPF, DMARC, and DKIM configuration; persists if authenticated
 * @access Public / Optional Auth
 */
router.post('/audit', optionalAuth, handleDomainScan);

/**
 * @route GET /api/scan/history
 * @desc  Fetch user scan history
 * @access Private
 */
router.get('/history', requireAuth, getHistory);

module.exports = router;
