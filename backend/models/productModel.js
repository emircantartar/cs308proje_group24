import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    reviewText: {
        type: String,
        default: ""
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order',
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discountRate: { type: Number },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: Array, required: true },
    bestseller: { type: Boolean },
    date: { type: Number, required: true },
    model: { type: String },
    serieNo: { type: Number },
    quantity: { type: Number, required: true, default: 0 },
    warranty: { type: String },
    distributor: { type: String },
    reviews: [reviewSchema], // Embed review schema
    averageRating: { type: Number, default: 0 }, // Store average rating
    reviewCount: { type: Number, default: 0 }, // Count total reviews
});

productSchema.pre("save", function (next) {
    if (this.isNew || !this.originalPrice) {
        this.originalPrice = this.price;
    }
    next();
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
