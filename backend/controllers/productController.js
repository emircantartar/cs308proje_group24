import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function for adding a product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
      model, // New field
      serieNo, // New field
      quantity, // New field
      warranty, // New field
      distributor, // New field
      review,
    } = req.body;

    // Handle image uploads
    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];

    const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

    const imagesUrl = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
        return result.secure_url;
      })
    );

    // Construct product data
    const productData = {
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      sizes: JSON.parse(sizes),
      bestseller: bestseller === "true",
      model, // New field
      serieNo: serieNo ? Number(serieNo) : null, // Ensure it is stored as a number
      quantity: quantity ? Number(quantity) : null, // Ensure it is stored as a number
      warranty,
      distributor,
      image: imagesUrl,
      date: Date.now(),
    };

    console.log(productData);

    // Save product to database
    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// Function for listing products with category counts
// Function for listing products with search functionality
const listProducts = async (req, res) => {
  try {
    const { search } = req.query; // Accept search query from the frontend

    // Build the query based on search
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } }, // Case-insensitive search by name
          { description: { $regex: search, $options: "i" } }, // Case-insensitive search by description
        ],
      };
    }


    
    // Fetch products based on query
    const products = await productModel.find({});

     // Use aggregation to count the number of products in each category
    const categoryCounts = await productModel.aggregate([
      {
        $group: {
          _id: "$category", // Group by category
          count: { $sum: 1 }, // Count unique items
        },
      },
    ]);


   

    // Respond with products and category counts
    res.json({ success: true, products, categoryCounts });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};




// Function for removing a product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Function for fetching single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Apply discount and notify users
const applyDiscount = async (req, res) => {
    try {
        const { productIds, discountRate } = req.body;
        
        // Get all products to be discounted
        const products = await productModel.find({ _id: { $in: productIds } });
        
        // Update prices and collect product details
        const updatedProducts = [];
        for (const product of products) {
            // If no originalPrice is set, use current price as original
            if (!product.originalPrice) {
                product.originalPrice = product.price;
            }
            
            const newPrice = product.originalPrice * (1 - discountRate / 100);
            
            await productModel.findByIdAndUpdate(product._id, {
                price: newPrice,
                originalPrice: product.originalPrice,  // Ensure originalPrice is saved
                discountRate: discountRate
            });
            
            updatedProducts.push({
                id: product._id,
                name: product.name,
                originalPrice: product.originalPrice,
                newPrice,
                discountRate
            });
        }
        
        // Find users with these products in their wishlist
        const users = await userModel.find({
            'wishlist': { $in: productIds }
        });
        
        // Send notifications to users
        for (const user of users) {
            const userProducts = updatedProducts.filter(product => 
                user.wishlist.includes(product.id)
            );
            
            if (userProducts.length > 0) {
                // Send email notification
                const emailContent = `
                    Hello ${user.name},
                    
                    Good news! The following items in your wishlist are now on discount:
                    
                    ${userProducts.map(product => `
                        ${product.name}
                        Original Price: $${product.originalPrice}
                        New Price: $${product.newPrice}
                        Discount: ${discountRate}%
                    `).join('\n')}
                    
                    Don't miss out on these great deals!
                `;
                
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: 'Products in your wishlist are now on discount!',
                    text: emailContent
                });
            }
        }
        
        res.json({
            success: true,
            message: 'Discount applied and users notified',
            updatedProducts
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Remove discount
const removeDiscount = async (req, res) => {
    try {
        const { productIds } = req.body;
        
        // Get all products
        const products = await productModel.find({ _id: { $in: productIds } });
        
        // Remove discounts
        const updatedProducts = [];
        for (const product of products) {
            console.log('Product:', product.name, 'Discount Rate:', product.discountRate);
            
            // Check if product has a discount
            if (!product.discountRate || !product.originalPrice) {
                continue; // Skip products without discount
            }
            
            // Restore original price
            await productModel.findByIdAndUpdate(product._id, {
                price: product.originalPrice,
                $unset: { discountRate: "" }  // Remove the discountRate field
            });
            
            updatedProducts.push({
                id: product._id,
                name: product.name,
                restoredPrice: product.originalPrice,
                previousDiscountedPrice: product.price,
                previousDiscountRate: product.discountRate
            });
        }
        
        // Log the results
        console.log('Products to update:', products.length);
        console.log('Products updated:', updatedProducts.length);
        
        res.json({
            success: true,
            message: updatedProducts.length > 0 ? 'Discounts removed successfully' : 'No discounted products found',
            updatedProducts
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Set new base price
const setPrice = async (req, res) => {
    try {
        const { productIds, newPrice } = req.body;
        
        // Get all products
        const products = await productModel.find({ _id: { $in: productIds } });
        
        // Update prices
        const updatedProducts = [];
        for (const product of products) {
            // Update the product with new base price
            await productModel.findByIdAndUpdate(product._id, {
                price: newPrice,
                originalPrice: newPrice,  // Update original price too
                $unset: { discountRate: "" }  // Remove any existing discount
            });
            
            updatedProducts.push({
                id: product._id,
                name: product.name,
                oldPrice: product.price,
                newPrice: newPrice
            });
            
            console.log(`Product ${product.name}: Old Price = ${product.price}, New Price = ${newPrice}`);
        }
        
        res.json({
            success: true,
            message: 'Prices updated successfully',
            updatedProducts
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { listProducts, addProduct, removeProduct, singleProduct, applyDiscount, removeDiscount, setPrice };
