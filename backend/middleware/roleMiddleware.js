// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.',
    });
  }
};

// Ambassador only middleware
export const ambassadorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ambassador') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Ambassador only.',
    });
  }
};

// Multiple roles middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};
