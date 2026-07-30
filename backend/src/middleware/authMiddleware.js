const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token missing or invalid. Please log in.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'estetica_super_secret_jwt_key_2026_role_based_auth';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token expired or invalid. Please log in again.'
    });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User role not found.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] role(s). Your role is '${req.user.role}'.`
      });
    }

    next();
  };
};

const { getAsync } = require('../config/db');

const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User role or identity not found.'
      });
    }

    // Owner has unrestricted access to all modules
    if (req.user.role === 'owner') {
      return next();
    }

    try {
      // Query user permissions from database
      const userRecord = await getAsync('SELECT role, permissions FROM users WHERE id = ?', [req.user.id]);
      if (!userRecord) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. User record not found.'
        });
      }

      let perms = [];
      try {
        perms = typeof userRecord.permissions === 'string' ? JSON.parse(userRecord.permissions) : (userRecord.permissions || []);
      } catch (e) {
        perms = ['dashboard', 'appointments'];
      }

      if (perms.includes('all') || perms.includes(requiredPermission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Forbidden: You do not have permission to access '${requiredPermission}'.`
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Error verifying permissions.'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission
};
