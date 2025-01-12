import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);
  const [ratingMessage, setRatingMessage] = useState(""); // Success/error message for rating

  // 1) Load order data from the backend
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

            // Push into a flat array for easy rendering
            allOrdersItem.push(item);
          });
        });

        // Sort by date, newest first
        setOrderData(allOrdersItem.sort((a, b) => b.date - a.date));
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

      // First submit the review to the product
      const reviewResponse = await axios.post(
        `${backendUrl}/api/product/review`,
        { productId, rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (reviewResponse.data.success) {
        // Then mark the order item as reviewed
        const orderResponse = await axios.post(
          `${backendUrl}/api/order/reviewed/${orderId}`,
          { productId, rating },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (orderResponse.data.success) {
          setRatingMessage("Rating submitted successfully!");
          loadOrderData(); // Reload order data to reflect the changes
        }
      } else {
        setRatingMessage(reviewResponse.data.message || "Failed to submit rating.");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      if (error.response?.status !== 401) {
        setRatingMessage(
          error.response?.data?.message || "Error submitting rating. Please try again."
        );
      }
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
          },
        }
      );

      if (response.data.success) {
        toast.success("Invoice downloaded successfully!");
        // Handle the downloaded invoice
      } else {
        toast.error(response.data.message || "Failed to download invoice.");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      if (error.response?.status !== 401) {
        toast.error(
          error.response?.data?.message || "Error downloading invoice. Please try again."
        );
      }
    }
  };

  useEffect(() => {
    loadOrderData();
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
                    item.status === "Delivered" ? "bg-green-500" : "bg-gray-500"
                  }`}
                ></p>
                <p className="text-sm md:text-base">{item.status}</p>
              </div>

              {/* If delivered, show invoice buttons + return logic */}
              {item.status === "Delivered" && (
                <div className="flex flex-col gap-3 items-start">
                  <div className="flex gap-3">
                    <button
                      onClick={() => downloadInvoice(item.orderId)}
                      className="border px-4 py-2 text-sm font-medium rounded-sm"
                    >
                      View Invoice
                    </button>
                    <button
                      onClick={() => sendInvoice(item.orderId, item.email)}
                      className="border px-4 py-2 text-sm font-medium rounded-sm"
                    >
                      Email Invoice
                    </button>

                    {/* Conditionally show "Request Return" or "Return Status" */}
                    {item.returnStatus === "none" ? (
                      <button
                        onClick={() => requestReturn(item.orderId)}
                        className="border px-4 py-2 text-sm font-medium rounded-sm"
                      >
                        Request Return
                      </button>
                    ) : (
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

                  {/* Rating Section */}
                  <div className="mt-2">
                    <p className="text-sm">Rate this product:</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => submitRating(item.orderId, item._id, star)}
                          className="text-yellow-500 hover:text-yellow-700"
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
