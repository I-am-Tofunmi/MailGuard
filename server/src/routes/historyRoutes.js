const express = require('express');
const router = express.Router();
const {
  getHistory,
  getHistoryById,
  deleteHistoryById,
} = require('../controllers/historyController');
const { requireAuth } = require('../middlewares/authMiddleware');

// Protect all history endpoints with authentication middleware
router.use(requireAuth);

/**
 * @route GET /api/history or GET /api/scans/history
 * @desc  Fetch paginated scan history for the authenticated user
 * @access Private
 */
router.get('/history', getHistory);
router.get('/', getHistory);

/**
 * @route GET /api/history/:id
 * @desc  Fetch a specific scan by id for the authenticated user
 * @access Private
 */
router.get('/:id', getHistoryById);

/**
 * @route DELETE /api/history/:id
 * @desc  Delete a scan by id for the authenticated user
 * @access Private
 */
router.delete('/:id', deleteHistoryById);

module.exports = router;
