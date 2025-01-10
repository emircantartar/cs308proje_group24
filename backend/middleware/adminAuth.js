import jwt from 'jsonwebtoken';

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized. Please log in again.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Please log in again.',
      });
    }

    const validRoles = ['admin', 'sales_manager', 'product_manager'];
    if (!validRoles.includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Insufficient privileges.',
      });
    }

    // Add user info to request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    console.error('Admin Authentication Error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Session expired. Please log in again.' 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. Please log in again.' 
      });
    }
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed. Please log in again.' 
    });
  }
};

export default adminAuth;
