const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/apiResponse');

/**
 * JWT Authentication Middleware
 * Verifies the access token from Authorization header.
 * Attaches req.user on success.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access token is required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Access token has expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid access token', 401);
    }
    return sendError(res, 'Authentication failed', 500);
  }
};

/**
 * Optional authentication – attaches user if token exists but does not error if missing.
 */
const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return authenticate(req, res, next);
};

module.exports = { authenticate, optionalAuthenticate };
