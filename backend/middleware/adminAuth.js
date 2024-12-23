import jwt from 'jsonwebtoken'

const adminAuth = async (req,res,next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.json({success:false,message:"Not Authorized Login Again"})
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check for valid roles
        const validRoles = ['admin', 'sales_manager', 'product_manager'];
        if (!validRoles.includes(decoded.role)) {
            return res.json({success:false,message:"Not Authorized Login Again"})
        }

        // Add role to request for future use
        req.userRole = decoded.role;
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default adminAuth