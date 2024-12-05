import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

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

export { listProducts, addProduct, removeProduct, singleProduct};
