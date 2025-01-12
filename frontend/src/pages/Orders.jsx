import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);
  const [ratingMessage, setRatingMessage] = useState(""); // Success/error message for rating
  const [userRatings, setUserRatings] = useState({}); // Store user ratings for each product
  const [userEmail, setUserEmail] = useState(""); // Add state for user email

  // 1) Load order data and user ratings from the backend
  const loadOrderData = async () => {
    try {
      if (!token) return;

      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        let allOrdersItem = [];
        // For each order returned by backend
        response.data.orders.forEach((order) => {
          // For each item in that order
          order.items.forEach((item) => {
            // Copy relevant fields onto each item
            item.status = order.status;
            item.payment = order.payment;
            item.paymentMethod = order.paymentMethod;
            item.date = order.date;
            item.orderId = order._id;
            item.returnStatus = order.returnStatus || "none";
            item.refundAmount = order.refundAmount || null;
            // Add reviewedItems to track if this specific order item has been reviewed
            item.isReviewed = order.reviewedItems ? order.reviewedItems.includes(item._id) : false;

            // Push into a flat array for easy rendering
            allOrdersItem.push(item);
          });
        });

        // Sort by date, newest first
        setOrderData(allOrdersItem.sort((a, b) => b.date - a.date));

        // Load user ratings for each order item
        const ratings = {};
        for (const item of allOrdersItem) {
          try {
            const ratingResponse = await axios.get(
              `${backendUrl}/api/product/reviews/${item._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (ratingResponse.data.success && ratingResponse.data.reviews) {
              // Get user ID from the token
              const decodedToken = JSON.parse(atob(token.split('.')[1]));
              const userId = decodedToken.id;

              // Find the review for this specific order item by checking both user and orderId
              const userReview = ratingResponse.data.reviews.find(
                (review) => 
                  review.user._id === userId && 
                  review.orderId && 
                  review.orderId.toString() === item.orderId.toString()
              );

              if (userReview) {
                // Store rating by orderId
                ratings[item.orderId] = {
                  rating: userReview.rating,
                  productId: item._id,
                  date: userReview.date
                };
              }
            }
          } catch (error) {
            console.error("Error loading rating for product:", error);
          }
        }
        setUserRatings(ratings);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      if (error.response?.status !== 401) {
        console.error(
          "Error loading orders:",
          error.response?.data?.message || "Failed to load orders"
        );
      }
    }
  };

  // 2) Submit Rating
  const submitRating = async (orderId, productId, rating) => {
    try {
      if (!token) return alert("Please log in to submit a rating.");

      // Submit the review to the product
      const reviewResponse = await axios.post(
        `${backendUrl}/api/product/review`,
        { productId, rating, orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (reviewResponse.data.success) {
        // Update the local state with the new rating
        setUserRatings(prev => ({
          ...prev,
          [orderId]: {
            rating: rating,
            productId: productId,
            date: new Date()
          }
        }));

        // Update the order data to reflect the review status
        setOrderData(prevData => 
          prevData.map(item => {
            if (item.orderId === orderId && item._id === productId) {
              return {
                ...item,
                isReviewed: true
              };
            }
            return item;
          })
        );

        setRatingMessage(reviewResponse.data.message);
      } else {
        setRatingMessage(reviewResponse.data.message || "Failed to submit rating.");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setRatingMessage(
        error.response?.data?.message || "Error submitting rating. Please try again."
      );
    }
  };

  // 3) Request Return
  const requestReturn = async (orderId) => {
    try {
      if (!token) return alert("Please log in to request a return.");

      const response = await axios.post(
        `${backendUrl}/api/order/return/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Return request submitted successfully!");
        loadOrderData(); // Reload order data to reflect the changes
      } else {
        toast.error(response.data.message || "Failed to submit return request.");
      }
    } catch (error) {
      console.error("Error requesting return:", error);
      if (error.response?.status !== 401) {
        toast.error(
          error.response?.data?.message || "Error requesting return. Please try again."
        );
      }
    }
  };

  // 4) Download Invoice
  const downloadInvoice = async (orderId) => {
    try {
      if (!token) return alert("Please log in to download an invoice.");

      const response = await axios.get(
        `${backendUrl}/api/order/invoice/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/pdf',
          },
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      if (error.response?.status !== 401) {
        toast.error(
          error.response?.data?.message || "Error downloading invoice. Please try again."
        );
      }
    }
  };

  // Add cancelOrder function
  const cancelOrder = async (orderId) => {
    try {
      if (!token) return alert("Please log in to cancel the order.");

      const response = await axios.post(
        `${backendUrl}/api/order/cancel/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully!");
        loadOrderData(); // Reload orders to reflect the changes
      } else {
        toast.error(response.data.message || "Failed to cancel order.");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(
        error.response?.data?.message || "Error cancelling order. Please try again."
      );
    }
  };

  // Add function to fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUserEmail(response.data.user.email);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Add sendInvoice function
  const sendInvoice = async (orderId) => {
    try {
      if (!token) return alert("Please log in to send invoice.");

      const response = await axios.post(
        `${backendUrl}/api/order/invoice/email`,
        { 
          orderId,
          email: userEmail 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Invoice sent to your email successfully!");
      } else {
        toast.error(response.data.message || "Failed to send invoice.");
      }
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error(
        error.response?.data?.message || "Error sending invoice. Please try again."
      );
    }
  };

  useEffect(() => {
    loadOrderData();
    fetchUserProfile(); // Add this line to fetch user profile
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      {/* Rating Message */}
      {ratingMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mb-4 rounded">
          {ratingMessage}
        </div>
      )}

      <div>
        {orderData.map((item, index) => (
          <div
            key={index}
            className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            {/* Left side: Product details */}
            <div className="flex items-start gap-6 text-sm">
              {item.image && item.image[0] && (
                <img className="w-16 sm:w-20" src={item.image[0]} alt="" />
              )}
              <div>
                <p className="sm:text-base font-medium">{item.name}</p>
                <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                  <p>
                    {currency}
                    {Number(item.price).toFixed(2)}
                  </p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                </div>
                <p className="mt-1">
                  Date:{" "}
                  <span className="text-gray-400">
                    {new Date(item.date).toDateString()}
                  </span>
                </p>
                <p className="mt-1">
                  Payment:{" "}
                  <span className="text-gray-400">{item.paymentMethod}</span>
                </p>
              </div>
            </div>

            {/* Right side: Status, Actions, and Rating */}
            <div className="md:w-1/2 flex flex-col md:flex-row justify-between items-center gap-3">
              {/* Order status display */}
              <div className="flex items-center gap-2">
                <p
                  className={`min-w-2 h-2 rounded-full ${
                    item.status === "Delivered" ? "bg-green-500" : 
                    item.status === "cancelled" ? "bg-red-500" : "bg-gray-500"
                  }`}
                ></p>
                <p className="text-sm md:text-base">{item.status}</p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 items-start">
                {/* Cancel button for Placed or Packing status */}
                {(item.status.toLowerCase() === "placed" || 
                  item.status.toLowerCase() === "order placed" || 
                  item.status.toLowerCase() === "packing") && (
                  <button
                    onClick={() => cancelOrder(item.orderId)}
                    className="border px-4 py-2 text-sm font-medium rounded-sm bg-red-500 text-white hover:bg-red-600"
                  >
                    Cancel Order
                  </button>
                )}

                {/* Delivered order actions */}
                {item.status === "Delivered" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => downloadInvoice(item.orderId)}
                      className="border px-4 py-2 text-sm font-medium rounded-sm"
                    >
                      View Invoice
                    </button>
                    <button
                      onClick={() => sendInvoice(item.orderId)}
                      className="border px-4 py-2 text-sm font-medium rounded-sm"
                    >
                      Email Invoice
                    </button>

                    {/* Return request section */}
                    {item.status === "Delivered" && item.returnStatus === "none" && !userRatings[item.orderId] && (
                      <button
                        onClick={() => requestReturn(item.orderId)}
                        className="border px-4 py-2 text-sm font-medium rounded-sm"
                      >
                        Request Return
                      </button>
                    )} 
                    {item.returnStatus !== "none" && (
                      <div className="text-sm">
                        <span className={
                          item.returnStatus === 'approved' ? 'text-green-600' :
                          item.returnStatus === 'rejected' ? 'text-red-600' :
                          item.returnStatus === 'refunded' ? 'text-green-600' :
                          'text-blue-600'
                        }>
                          Return {item.returnStatus.charAt(0).toUpperCase() + item.returnStatus.slice(1)}
                        </span>
                        {(item.returnStatus === 'approved' || item.returnStatus === 'refunded') && item.refundAmount && (
                          <div className="mt-1 text-green-600">
                            Refund Amount: {currency}{Number(item.refundAmount).toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Rating Section - only show for delivered items, regardless of return status */}
                {item.status === "Delivered" && (
                  <div className="mt-2">
                    <p className="text-sm">Rate this product:</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => submitRating(item.orderId, item._id, star)}
                          className={`text-2xl ${
                            star <= (userRatings[item.orderId]?.rating || 0)
                              ? "text-yellow-500"
                              : "text-gray-300"
                          } hover:text-yellow-500 transition-colors`}
                        >
                          ★
                        </button>
                      ))}
                      {userRatings[item.orderId] && (
                        <span className="text-sm text-gray-500 ml-2">
                          (Your rating: {userRatings[item.orderId].rating})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
