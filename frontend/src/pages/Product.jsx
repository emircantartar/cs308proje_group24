import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // For wishlist feedback
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Grab this product from the `products` array
  const fetchProductData = async () => {
    const found = products.find((item) => item._id === productId);
    if (found) {
      setProductData(found);
      setImage(found.image[0]);

      // Fetch rating information
      const response = await fetch(`http://localhost:4000/api/product/reviews/${productId}`);
      const data = await response.json();
      if (response.ok) {
        setAverageRating(data.averageRating || 0);
        setReviewCount(data.reviewCount || 0);
      } else {
        console.error("Failed to fetch rating info:", data.message);
      }
    }
  };

  useEffect(() => {
    fetchProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, products]);

  // Handler to add product to wishlist
  const handleAddToWishlist = async () => {
    try {
      // Grab token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("You must be logged in to add to wishlist.");
        return;
      }

      // Call the backend with "Authorization" header
      const response = await fetch("http://localhost:4000/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();
      if (response.ok) {
        setWishlistMessage("Product added to your wishlist!");
        setErrorMessage("");
      } else {
        setWishlistMessage("");
        setErrorMessage(data.message || "Failed to add to wishlist.");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      setWishlistMessage("");
      setErrorMessage("An error occurred while adding to wishlist.");
    }
  };

  if (!productData) {
    return <div className="opacity-0"></div>;
  }

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Wishlist / Error Messages */}
      {wishlistMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mb-4 rounded">
          {wishlistMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
          {errorMessage}
        </div>
      )}

      {/* Product Data */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Product Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt={`Product Image ${index + 1}`}
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={image} alt="Selected" />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          {productData.discountRate > 0 && (
            <div className="mt-2 inline-block bg-red-500 text-white px-3 py-1 rounded-md text-sm">
              {productData.discountRate}% OFF
            </div>
          )}
          <div className="flex items-center gap-1 mt-2">
            {/* Dynamically display average rating */}
            {[...Array(5)].map((_, index) => (
              <img
                key={index}
                src={index < Math.round(averageRating) ? assets.star_icon : assets.star_dull_icon}
                alt=""
                className="w-3.5"
              />
            ))}
            <p className="pl-2">
              ({reviewCount} review{reviewCount === 1 ? "" : "s"})
            </p>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <p className="text-3xl font-medium">
              {currency}
              {Number(productData.price).toFixed(2)}
            </p>
            {productData.discountRate > 0 && (
              <p className="text-xl text-gray-500 line-through">
                {currency}
                {Number(productData.originalPrice).toFixed(2)}
              </p>
            )}
          </div>
          <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>

          {/* Display Additional Product Info */}
          <div className="mt-5 text-sm text-gray-700">
            {productData.model && (
              <p>
                <b>Model:</b> {productData.model}
              </p>
            )}
            {productData.serieNo && (
              <p>
                <b>Serial Number:</b> {productData.serieNo}
              </p>
            )}
            {productData.quantity === 0 ? (
              <p className="text-red-500 font-bold">
                <b>Out of Stock</b>
              </p>
            ) : (
              <p>
                <b>Available Quantity:</b> {productData.quantity}
              </p>
            )}
            {productData.warranty && (
              <p>
                <b>Warranty:</b> {productData.warranty}
              </p>
            )}
            {productData.distributor && (
              <p>
                <b>Distributor:</b> {productData.distributor}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? "border-orange-500" : ""
                  }`}
                  key={index}
                  disabled={productData.quantity === 0}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          {/* Buttons Section */}
          <div className="flex items-center gap-4">
            {/* Add to Cart */}
            <button
              onClick={() => addToCart(productData._id, size)}
              className={`px-8 py-3 text-sm ${
                productData.quantity === 0
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-black text-white active:bg-gray-700"
              }`}
              disabled={productData.quantity === 0}
            >
              {productData.quantity === 0 ? "Out of Stock" : "ADD TO CART"}
            </button>

            {/* Add to Wishlist */}
            <button
              onClick={handleAddToWishlist}
              className="px-8 py-3 text-sm bg-blue-500 text-white active:bg-blue-600"
            >
              Add to Wishlist
            </button>
          </div>

          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Description & Related Products */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  );
};

export default Product;
