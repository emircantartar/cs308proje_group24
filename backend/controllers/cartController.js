import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"

// add products to user cart
const addToCart = async (req,res) => {
    try {
        const { itemId, size } = req.body;
        const userId = req.user._id;  // Get userId from the token

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartData || {};

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            }
            else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Added To Cart" });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// update user cart
const updateCart = async (req,res) => {
    try {
        const { itemId, size, quantity } = req.body;
        const userId = req.user._id;  // Get userId from the token

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartData || {};

        cartData[itemId][size] = quantity;

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Cart Updated" });

    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// get user cart
const getUserCart = async (req, res) => {
    try {
        const userId = req.user._id;  // Get userId from the token

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const cartData = userData.cartData || {};
        const cartItems = [];

        // Get all product IDs from cart
        const productIds = Object.keys(cartData);

        // Fetch all products in one query
        const products = await productModel.find({ _id: { $in: productIds } });

        // Create a map of product ID to product data
        const productMap = products.reduce((map, product) => {
            map[product._id.toString()] = product;
            return map;
        }, {});

        // Build cart items array, skipping any products that no longer exist
        for (const productId of productIds) {
            const product = productMap[productId];
            if (product) {
                const sizes = cartData[productId];
                for (const [size, quantity] of Object.entries(sizes)) {
                    cartItems.push({
                        ...product.toObject(),
                        size,
                        cartQuantity: quantity
                    });
                }
            }
        }

        // Clean up any references to non-existent products
        const validProductIds = products.map(p => p._id.toString());
        const invalidProductIds = productIds.filter(id => !validProductIds.includes(id));
        
        if (invalidProductIds.length > 0) {
            const updateObj = invalidProductIds.reduce((obj, id) => {
                obj[`cartData.${id}`] = "";
                return obj;
            }, {});
            
            await userModel.findByIdAndUpdate(userId, { $unset: updateObj });
        }

        res.json({ success: true, cartItems });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { addToCart, updateCart, getUserCart }