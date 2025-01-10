import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";


const createToken = (id) => {
    return jwt.sign({ 
        id,
        role: 'user'  // Regular users get 'user' role
    }, process.env.JWT_SECRET)
}

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id)
            res.json({ 
                success: true, 
                token,
                role: 'user'
            })
        }
        else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: error.message })
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const {email, password} = req.body;

        // Sales Manager credentials
        if (email === process.env.SALES_MANAGER_EMAIL && password === process.env.SALES_MANAGER_PASSWORD) {
            const token = jwt.sign({ 
                id: 'sales_manager_id', 
                email, 
                role: 'sales_manager' 
            }, process.env.JWT_SECRET);
            res.json({success: true, token, role: 'sales_manager'});
            return;
        }

        // Product Manager credentials
        if (email === process.env.PRODUCT_MANAGER_EMAIL && password === process.env.PRODUCT_MANAGER_PASSWORD) {
            const token = jwt.sign({ 
                id: 'product_manager_id', 
                email, 
                role: 'product_manager' 
            }, process.env.JWT_SECRET);
            res.json({success: true, token, role: 'product_manager'});
            return;
        }

        // Regular admin credentials
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ 
                id: 'admin_id', 
                email, 
                role: 'admin' 
            }, process.env.JWT_SECRET);
            res.json({success: true, token, role: 'admin'});
            return;
        }

        res.json({success: false, message: "Invalid credentials"});

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error during login' 
        });
    }
}


export { loginUser, registerUser, adminLogin }