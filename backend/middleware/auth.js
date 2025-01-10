import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  try {
    // Check if Authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized. Please log in again.',
      });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user ID to the request object for further use
    req.user = { _id: decoded.id };

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.',
    });
  }
};

export default authUser;
