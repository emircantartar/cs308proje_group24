import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import notificationModel from "../models/notificationModel.js";
import nodemailer from 'nodemailer';
import axios from 'axios';

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});



// Add a review
export const addReview = async (req, res) => {
    try {
        const { productId, rating, reviewText, orderId } = req.body;
        const userId = req.user._id;

        // Find the product
        const product = await productModel.findById(productId)
            .populate({
                path: "reviews.user",
                select: "_id name"
            });
            
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Add new review
        const newReview = {
            user: userId,
            rating: Number(rating),
            reviewText: reviewText || "",
            date: new Date()
        };

        // Only add orderId if it exists
        if (orderId) {
            newReview.orderId = orderId;
        }

        // Check if a review for this specific order already exists
        const existingReviewIndex = orderId ? 
            product.reviews.findIndex(
                (review) => review.orderId && review.orderId.toString() === orderId.toString()
            ) : -1;
        
        if (existingReviewIndex !== -1) {
            // Update existing review for this order
            product.reviews[existingReviewIndex] = newReview;
        } else {
            // Add new review
            product.reviews.push(newReview);
        }

        // Calculate average rating - count all reviews
        const validReviews = product.reviews.filter(review => review.rating);
        const totalRatings = validReviews.reduce((acc, review) => acc + review.rating, 0);
        product.averageRating = validReviews.length > 0 ? totalRatings / validReviews.length : 0;
        product.reviewCount = validReviews.length;

        await product.save();

        // Return the populated reviews in the response
        const updatedProduct = await productModel.findById(productId)
            .populate({
                path: "reviews.user",
                select: "_id name"
            });

        res.json({ 
            success: true, 
            message: existingReviewIndex !== -1 ? "Review updated successfully" : "Review added successfully", 
            product: updatedProduct,
            reviews: updatedProduct.reviews
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get reviews for a product
export const getReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        // Find the product and populate user details
        const product = await productModel.findById(productId)
            .populate({
                path: "reviews.user",
                select: "_id name"  // Only select necessary fields
            });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, reviews: product.reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


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
    let query = {
      name: { $not: /Category Placeholder$/ } // Exclude placeholder products
    };

    if (search) {
      query = {
        $and: [
          { name: { $not: /Category Placeholder$/ } },
          {
            $or: [
              { name: { $regex: search, $options: "i" } }, // Case-insensitive search by name
              { description: { $regex: search, $options: "i" } }, // Case-insensitive search by description
            ]
          }
        ]
      };
    }
    
    // Fetch products based on query
    const products = await productModel.find(query);

    // Use aggregation to count the number of products in each category
    const categoryCounts = await productModel.aggregate([
      {
        $match: { name: { $not: /Category Placeholder$/ } }
      },
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
    const productId = req.body.id;
    
    // First, remove the product
    await productModel.findByIdAndDelete(productId);

    // Clean up cart references
    await userModel.updateMany(
      { [`cartData.${productId}`]: { $exists: true } },
      { $unset: { [`cartData.${productId}`]: "" } }
    );

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

    const products = await productModel.find({ _id: { $in: productIds } });
    const updatedProducts = [];

    for (const product of products) {
      if (!product.originalPrice) {
        product.originalPrice = product.price;
      }

      const newPrice = product.originalPrice * (1 - discountRate / 100);

      await productModel.findByIdAndUpdate(product._id, {
        price: newPrice,
        originalPrice: product.originalPrice,
        discountRate,
      });

      updatedProducts.push({
        id: product._id,
        name: product.name,
        originalPrice: product.originalPrice,
        newPrice,
        discountRate,
      });
    }

    // Send notifications through the notification endpoint
    try {
      await axios.post(
        `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/notifications/send`,
        { productIds, discountRate },
        { headers: { Authorization: `Bearer ${req.headers.token}` } }
      );
    } catch (error) {
      console.error('Error sending notifications:', error);
      // Don't fail the whole request if notifications fail
    }

    res.json({
      success: true,
      message: 'Discount applied and notifications sent',
      updatedProducts,
    });
  } catch (error) {
    console.error('Error in applyDiscount:', error);
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
                originalPrice: newPrice,  // Set new original price
                $unset: { discountRate: "" }  // Remove any existing discount
            });
            
            updatedProducts.push({
                id: product._id,
                name: product.name,
                oldPrice: product.originalPrice || product.price,
                newPrice: newPrice
            });
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

// Get all categories
const getCategories = async (req, res) => {
  try {
    // Use aggregation to get unique categories and their product counts
    const categories = await productModel.aggregate([
      {
        $facet: {
          allCategories: [
            {
              $group: {
                _id: "$category",
                subCategories: { 
                  $addToSet: {
                    $cond: [
                      { $eq: ["$subCategory", ""] },
                      null,
                      "$subCategory"
                    ]
                  }
                }
              }
            },
            {
              $project: {
                _id: 1,
                subCategories: {
                  $filter: {
                    input: "$subCategories",
                    as: "subCat",
                    cond: { $ne: ["$$subCat", null] }
                  }
                }
              }
            }
          ],
          nonPlaceholderCounts: [
            {
              $match: { name: { $not: /Category Placeholder$/ } }
            },
            {
              $group: {
                _id: "$category",
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]).then(results => {
      const [{ allCategories, nonPlaceholderCounts }] = results;
      
      // Combine the results
      const combinedCategories = allCategories.map(cat => ({
        category: cat._id,
        subCategories: cat.subCategories.filter(Boolean), // Remove any null/empty values
        count: nonPlaceholderCounts.find(c => c._id === cat._id)?.count || 0
      }));

      return combinedCategories.sort((a, b) => a.category.localeCompare(b.category));
    });

    res.json({ 
      success: true, 
      categories
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add new category
const addCategory = async (req, res) => {
  try {
    const { category, subCategories } = req.body;
    
    // Validate input
    if (!category) {
      return res.json({ success: false, message: "Category name is required" });
    }

    // Check if category already exists in the aggregation results
    const existingCategory = await productModel.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    if (existingCategory.some(cat => cat._id === category)) {
      return res.json({ success: false, message: "Category already exists" });
    }

    // Create placeholder products for each subcategory
    const placeholderProducts = (subCategories || ['']).map(subCategory => ({
      name: `${category} Category Placeholder`,
      description: `Placeholder product for category: ${category}, subcategory: ${subCategory}`,
      price: 0,
      category: category,
      subCategory: subCategory,
      sizes: [],
      image: [],
      quantity: 0,
      date: Date.now()
    }));

    // Save all placeholder products
    await productModel.insertMany(placeholderProducts);

    res.json({ 
      success: true, 
      message: "Category added successfully",
      category: {
        category,
        subCategories: subCategories || [],
        count: placeholderProducts.length
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { oldCategory, newCategory, subCategories } = req.body;
    
    // Validate input
    if (!oldCategory || !newCategory) {
      return res.json({ success: false, message: "Both old and new category names are required" });
    }

    // Check if new category already exists (unless it's the same as old)
    if (oldCategory !== newCategory) {
      const existingProducts = await productModel.findOne({ category: newCategory });
      if (existingProducts) {
        return res.json({ success: false, message: "New category name already exists" });
      }
    }

    // Delete all placeholder products for the old category
    await productModel.deleteMany({
      category: oldCategory,
      name: { $regex: /Category Placeholder$/ }
    });

    // Create new placeholder products for each subcategory
    const placeholderProducts = (subCategories || ['']).map(subCategory => ({
      name: `${newCategory} Category Placeholder`,
      description: `Placeholder product for category: ${newCategory}, subcategory: ${subCategory}`,
      price: 0,
      category: newCategory,
      subCategory: subCategory,
      sizes: [],
      image: [],
      quantity: 0,
      date: Date.now()
    }));

    // Save all new placeholder products
    await productModel.insertMany(placeholderProducts);

    // Update all non-placeholder products in the category
    await productModel.updateMany(
      { 
        category: oldCategory,
        name: { $not: /Category Placeholder$/ }
      },
      { 
        $set: { 
          category: newCategory
        }
      }
    );

    res.json({ 
      success: true, 
      message: "Category updated successfully"
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Delete category and all its products
const deleteCategory = async (req, res) => {
  try {
    const { category } = req.body;
    
    // First, get all products in this category
    const productsToDelete = await productModel.find({ category });
    const productIds = productsToDelete.map(product => product._id.toString());

    // Delete all products in the category
    await productModel.deleteMany({ category });

    // Clean up cart references for all deleted products
    for (const productId of productIds) {
      await userModel.updateMany(
        { [`cartData.${productId}`]: { $exists: true } },
        { $unset: { [`cartData.${productId}`]: "" } }
      );
    }

    res.json({ 
      success: true, 
      message: "Category and its products deleted successfully"
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update product category
const updateProductCategory = async (req, res) => {
  try {
    const { productId, category, subCategory } = req.body;
    
    // Validate input
    if (!productId || !category) {
      return res.json({ success: false, message: "Product ID and category are required" });
    }

    const product = await productModel.findByIdAndUpdate(
      productId,
      { 
        category,
        subCategory: subCategory || ''
      },
      { new: true }
    );

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({ 
      success: true, 
      message: "Product category updated successfully",
      product 
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Function to update stock when a return is approved
const updateStockReturn = async (req, res) => {
  try {
    const { productId, returnedQuantity } = req.body;

    // Find the product
    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // Update the stock by adding back the returned quantity
    const updatedQuantity = (product.quantity || 0) + Number(returnedQuantity);
    
    // Update the product with new quantity
    await productModel.findByIdAndUpdate(productId, {
      quantity: updatedQuantity
    });

    res.json({ 
      success: true, 
      message: "Stock updated successfully",
      newQuantity: updatedQuantity
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update product stock
const updateStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Validate quantity
    if (quantity < 0) {
      return res.json({ success: false, message: "Quantity cannot be negative" });
    }

    const product = await productModel.findByIdAndUpdate(
      productId,
      { quantity: Number(quantity) },
      { new: true }
    );

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({ 
      success: true, 
      message: "Stock updated successfully",
      product 
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addProduct,
  listProducts,
  removeProduct,
  singleProduct,
  applyDiscount,
  removeDiscount,
  setPrice,
  updateStock,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  updateProductCategory,
  updateStockReturn
};
