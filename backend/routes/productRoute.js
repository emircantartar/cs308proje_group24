import express from "express";
import {
    listProducts,
    addProduct,
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
    addReview,
    getReviews,
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import { authUser } from "../middleware/auth.js";

const productRouter = express.Router();

// Product management routes
productRouter.post("/add", adminAuth, upload.fields([{ name: "image1", maxCount: 1 }, { name: "image2", maxCount: 1 }, { name: "image3", maxCount: 1 }, { name: "image4", maxCount: 1 }]), addProduct);
productRouter.post("/remove", adminAuth, removeProduct);
productRouter.post("/single", singleProduct);
productRouter.get("/list", listProducts);
productRouter.post("/discount", adminAuth, applyDiscount);
productRouter.post("/remove-discount", adminAuth, removeDiscount);
productRouter.post("/set-price", adminAuth, setPrice);
productRouter.post("/update-stock", adminAuth, updateStock);

// Review routes
productRouter.post("/review", authUser, addReview); // Add a review
productRouter.get("/reviews/:productId", getReviews); // Fetch reviews for a product

// Category management routes
productRouter.get("/categories", getCategories);
productRouter.post("/category/add", adminAuth, addCategory);
productRouter.post("/category/update", adminAuth, updateCategory);
productRouter.post("/category/delete", adminAuth, deleteCategory);
productRouter.post("/update-category", adminAuth, updateProductCategory);

export default productRouter;
