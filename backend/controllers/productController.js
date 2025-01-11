import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import notificationModel from "../models/notificationModel.js";
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

    // Find users with these products in their wishlist
    const users = await userModel.find({ 'wishlist': { $in: productIds } }).populate('email');

    // Create notifications and send emails
    const notifications = [];
    for (const user of users) {
      const userProducts = updatedProducts.filter((updatedProduct) =>
        user.wishlist.includes(updatedProduct.id)
      );

      if (userProducts.length > 0) {
        for (const discountedProduct of userProducts) {
          // Create notification
          notifications.push({
            user: user._id,
            product: discountedProduct.id,
            message: `The product "${discountedProduct.name}" in your wishlist is now ${discountRate}% off! New price: $${discountedProduct.newPrice.toFixed(2)}`,
            isRead: false,
          });

          // Send email notification
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Price Drop Alert! 🎉',
            html: `
              <h2>Great news! A product in your wishlist is now on sale!</h2>
              <p><strong>${discountedProduct.name}</strong> is now ${discountRate}% off!</p>
              <p>Original price: $${discountedProduct.originalPrice.toFixed(2)}</p>
              <p>New price: $${discountedProduct.newPrice.toFixed(2)}</p>
              <p>Don't miss out on this great deal!</p>
              <a href="${process.env.FRONTEND_URL}/product/${discountedProduct.id}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">View Product</a>
            `
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${user.email} for product ${discountedProduct.name}`);
          } catch (error) {
            console.error(`Error sending email to ${user.email}:`, error);
          }
        }
      }
    }

    // Bulk insert notifications if any exist
    if (notifications.length > 0) {
      await notificationModel.insertMany(notifications);
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

// Update product stock
export const updateStock = async (req, res) => {
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

// Get all categories
export const getCategories = async (req, res) => {
  try {
    // Use aggregation to get unique categories and their product counts
    const categories = await productModel.aggregate([
      {
        $facet: {
          allCategories: [
            {
              $group: {
                _id: "$category",
                subCategories: { $addToSet: "$subCategory" }
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
        subCategories: cat.subCategories,
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
export const addCategory = async (req, res) => {
  try {
    const { category, subCategories } = req.body;
    
    console.log('Received category:', category);
    console.log('Received subCategories:', subCategories);
    
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

    // Create a placeholder product for each subcategory
    const subCategoriesArray = subCategories || [];
    console.log('Processed subCategoriesArray:', subCategoriesArray);
    
    if (subCategoriesArray.length === 0) {
      // If no subcategories, create one placeholder product
      const placeholderProduct = new productModel({
        name: `${category} Category Placeholder`,
        description: `Placeholder product for category: ${category}`,
        price: 0,
        category: category,
        subCategory: '',
        sizes: [],
        image: [],
        quantity: 0,
        date: Date.now()
      });
      await placeholderProduct.save();
      console.log('Created placeholder product with no subcategory');
    } else {
      // Create a placeholder product for each subcategory
      for (const subCategory of subCategoriesArray) {
        const placeholderProduct = new productModel({
          name: `${category} Category Placeholder`,
          description: `Placeholder product for category: ${category}`,
          price: 0,
          category: category,
          subCategory: subCategory,
          sizes: [],
          image: [],
          quantity: 0,
          date: Date.now()
        });
        await placeholderProduct.save();
        console.log('Created placeholder product with subcategory:', subCategory);
      }
    }

    res.json({ 
      success: true, 
      message: "Category added successfully",
      category: {
        category,
        subCategories: subCategoriesArray,
        count: subCategoriesArray.length || 1
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { oldCategory, newCategory, subCategories } = req.body;
    
    console.log('Update request received:', {
      oldCategory,
      newCategory,
      subCategories
    });
    
    // Validate input
    if (!oldCategory || !newCategory) {
      return res.json({ success: false, message: "Both old and new category names are required" });
    }

    // Check if new category already exists (unless it's the same as old)
    if (oldCategory !== newCategory) {
      const existingCategory = await productModel.findOne({ 
        category: newCategory,
        name: { $not: /Category Placeholder$/ }
      });
      if (existingCategory) {
        return res.json({ success: false, message: "New category name already exists" });
      }
    }

    // First, update all non-placeholder products
    await productModel.updateMany(
      { 
        category: oldCategory,
        name: { $not: /Category Placeholder$/ }
      },
      { 
        $set: { category: newCategory }
      }
    );

    // Then, delete all existing placeholder products for this category
    await productModel.deleteMany({
      category: oldCategory,
      name: /Category Placeholder$/
    });

    // Create new placeholder products for each subcategory
    if (subCategories && subCategories.length > 0) {
      for (const subCategory of subCategories) {
        const placeholderProduct = new productModel({
          name: `${newCategory} Category Placeholder`,
          description: `Placeholder product for category: ${newCategory}`,
          price: 0,
          category: newCategory,
          subCategory: subCategory,
          sizes: [],
          image: [],
          quantity: 0,
          date: Date.now()
        });
        await placeholderProduct.save();
      }
    } else {
      // Create a default placeholder if no subcategories
      const placeholderProduct = new productModel({
        name: `${newCategory} Category Placeholder`,
        description: `Placeholder product for category: ${newCategory}`,
        price: 0,
        category: newCategory,
        subCategory: '',
        sizes: [],
        image: [],
        quantity: 0,
        date: Date.now()
      });
      await placeholderProduct.save();
    }

    // Get updated category data
    const updatedCategory = await productModel.aggregate([
      {
        $match: { category: newCategory }
      },
      {
        $group: {
          _id: "$category",
          subCategories: { $addToSet: "$subCategory" },
          count: {
            $sum: {
              $cond: [
                { $not: [{ $regexMatch: { input: "$name", regex: /Category Placeholder$/ } }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const categoryData = updatedCategory[0] || {
      _id: newCategory,
      subCategories: subCategories || [''],
      count: 0
    };

    res.json({ 
      success: true, 
      message: "Category updated successfully",
      category: {
        category: newCategory,
        subCategories: categoryData.subCategories.filter(s => s !== ''),
        count: categoryData.count
      }
    });
  } catch (error) {
    console.log('Error in updateCategory:', error);
    res.json({ success: false, message: error.message });
  }
};

// Delete category and all its products
export const deleteCategory = async (req, res) => {
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
export const updateProductCategory = async (req, res) => {
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

export { addProduct, listProducts, removeProduct, singleProduct, applyDiscount, removeDiscount, setPrice };
