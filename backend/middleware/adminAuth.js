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

    const validRoles = ['admin', 'sales_manager', 'product_manager'];
    if (!validRoles.includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Insufficient privileges.',
      });
    }

    req.userRole = decoded.role;
    next();
  } catch (error) {
    console.error('Admin Authentication Error:', error);
    res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
  }
};

export default adminAuth;
