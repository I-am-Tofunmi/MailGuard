const { supabase } = require('../config/supabase');

/**
 * Middleware to require authentication.
 * Validates the Bearer token against Supabase Auth.
 * Rejects with 401 if token is missing, malformed, or invalid/expired.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed authorization token',
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed authorization token',
    });
  }

  if (!supabase) {
    console.error('AuthMiddleware Error: Supabase client is not configured.');
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Supabase client is not configured on the server.',
    });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired session token',
      });
    }

    req.user = data.user;
    return next();
  } catch (err) {
    console.error('Authentication verification error:', err);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired session token',
    });
  }
}

/**
 * Middleware for optional authentication.
 * If a valid Bearer token is provided, attaches the user to `req.user`.
 * If missing, invalid, or expired, sets `req.user = null` and proceeds without throwing a 401.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.slice(7).trim();
  if (!token || !supabase) {
    req.user = null;
    return next();
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      req.user = null;
    } else {
      req.user = data.user;
    }
  } catch {
    req.user = null;
  }

  return next();
}

module.exports = {
  requireAuth,
  optionalAuth,
};
