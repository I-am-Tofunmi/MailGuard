const express = require('express');
const router = express.Router();
const { handleDomainScan } = require('../controllers/scanController');
const { optionalAuth } = require('../middlewares/authMiddleware');

/**
 * @route POST /api/scan/audit
 * @desc  Audits domain for MX, SPF, DMARC, and DKIM configuration; persists if authenticated
 * @access Public / Optional Auth
 */
router.post('/audit', optionalAuth, handleDomainScan);

module.exports = router;
