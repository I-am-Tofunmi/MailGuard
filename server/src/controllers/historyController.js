const db = require('../config/db');

/**
 * Controller to fetch paginated scan history for the authenticated user.
 * GET /api/history
 * Query params: page, limit, search, status
 */
async function getHistory(req, res) {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;
    const { search, status } = req.query;

    const conditions = ['user_id = $1'];
    const params = [userId];
    let paramIndex = 2;

    if (search && typeof search === 'string' && search.trim()) {
      conditions.push(`domain ILIKE $${paramIndex}`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (status && typeof status === 'string' && status.trim()) {
      conditions.push(`status = $${paramIndex}`);
      params.push(status.trim().toLowerCase());
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Query total matching records
    const countSql = `SELECT COUNT(*) AS total FROM scans WHERE ${whereClause};`;
    const countRes = await db.query(countSql, params);
    const total = parseInt(countRes.rows[0]?.total || 0, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    // Fetch paginated scan records
    const selectSql = `
      SELECT id, domain, status, score, summary, results, created_at
      FROM scans
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;
    const selectParams = [...params, limit, offset];
    const dataRes = await db.query(selectSql, selectParams);

    const formattedRows = (dataRes.rows || []).map((row) => ({
      ...row,
      summary: typeof row.summary === 'string' ? safeParseJson(row.summary) : row.summary,
      results: typeof row.results === 'string' ? safeParseJson(row.results) : row.results,
    }));

    return res.status(200).json({
      success: true,
      data: formattedRows,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching scan history:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An error occurred while fetching scan history.',
    });
  }
}

/**
 * Controller to fetch a single scan by id for the authenticated user.
 * GET /api/history/:id
 */
async function getHistoryById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Scan ID is required.',
      });
    }

    const selectSql = `
      SELECT id, user_id, domain, status, score, summary, results, created_at
      FROM scans
      WHERE id = $1 AND user_id = $2;
    `;
    const dataRes = await db.query(selectSql, [id, userId]);

    if (!dataRes.rows || dataRes.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Scan not found',
      });
    }

    const row = dataRes.rows[0];
    const formatted = {
      ...row,
      summary: typeof row.summary === 'string' ? safeParseJson(row.summary) : row.summary,
      results: typeof row.results === 'string' ? safeParseJson(row.results) : row.results,
    };

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching scan by id:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An error occurred while fetching the scan.',
    });
  }
}

/**
 * Controller to delete a scan by id for the authenticated user.
 * DELETE /api/history/:id
 */
async function deleteHistoryById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Scan ID is required.',
      });
    }

    const deleteSql = `
      DELETE FROM scans
      WHERE id = $1 AND user_id = $2
      RETURNING id;
    `;
    const deleteRes = await db.query(deleteSql, [id, userId]);

    if (!deleteRes.rows || deleteRes.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Scan not found or unauthorized',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Scan deleted successfully',
      id: deleteRes.rows[0].id,
    });
  } catch (error) {
    console.error('Error deleting scan by id:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An error occurred while deleting the scan.',
    });
  }
}

function safeParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

module.exports = {
  getHistory,
  getHistoryById,
  deleteHistoryById,
};
