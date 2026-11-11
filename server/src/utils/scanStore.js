/**
 * Resilient in-memory store for user scans.
 * Keeps scan records available in development or when database connection is unavailable.
 */

const scans = [];

function saveScan({ id, userId, domain, status, score, summary, results, explanation, createdAt }) {
  const record = {
    id: id || `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    user_id: userId,
    domain,
    status,
    score,
    summary,
    results,
    explanation,
    created_at: createdAt || new Date().toISOString(),
  };

  const existingIndex = scans.findIndex((s) => s.id === record.id);
  if (existingIndex >= 0) {
    scans[existingIndex] = record;
  } else {
    scans.unshift(record);
  }

  return record;
}

function getUserScans(userId, { search, status, page = 1, limit = 10 } = {}) {
  let filtered = scans.filter((s) => s.user_id === userId);

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((s) => s.domain && s.domain.toLowerCase().includes(q));
  }

  if (status && typeof status === 'string' && status.trim() && status !== 'all') {
    const st = status.trim().toLowerCase();
    filtered = filtered.filter((s) => s.status && s.status.toLowerCase() === st);
  }

  // Ensure ordered by created_at DESC
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const data = filtered.slice(offset, offset + limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

function getScanById(id, userId) {
  return scans.find((s) => s.id === id && (!userId || s.user_id === userId)) || null;
}

function deleteScan(id, userId) {
  const idx = scans.findIndex((s) => s.id === id && (!userId || s.user_id === userId));
  if (idx >= 0) {
    scans.splice(idx, 1);
    return true;
  }
  return false;
}

module.exports = {
  saveScan,
  getUserScans,
  getScanById,
  deleteScan,
};
