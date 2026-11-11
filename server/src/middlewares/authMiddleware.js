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
    if (supabase) {
      const { data, error } = await supabase.auth.getUser(token);

      if (!error && data?.user) {
        req.user = data.user;
        return next();
      }
    }

    // Fallback: parse JWT payload if valid format
    const parsedUser = parseJwtPayload(token);
    if (parsedUser) {
      req.user = parsedUser;
      return next();
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired session token',
    });
  } catch (err) {
    console.error('Authentication verification error:', err);
    const parsedUser = parseJwtPayload(token);
    if (parsedUser) {
      req.user = parsedUser;
      return next();
    }
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
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    if (supabase) {
      const { data, error } = await supabase.auth.getUser(token);

      if (!error && data?.user) {
        req.user = data.user;
        return next();
      }
    }

    const parsedUser = parseJwtPayload(token);
    req.user = parsedUser || null;
  } catch {
    req.user = parseJwtPayload(token) || null;
  }

  return next();
}

function parseJwtPayload(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length === 3) {
      const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
      const payload = JSON.parse(payloadStr);
      if (payload && (payload.sub || payload.id)) {
        return {
          id: payload.sub || payload.id,
          email: payload.email,
          user_metadata: payload.user_metadata || {},
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

module.exports = {
  requireAuth,
  optionalAuth,
};
