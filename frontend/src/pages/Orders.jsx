// src/pages/Orders.jsx
import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);

  // 1) Load order data from the backend
  const loadOrderData = async () => {
    try {
      if (!token) return;

      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        { headers: { token } }
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
            // NEW: copy the order's return status if provided by the backend
            // e.g., order.returnStatus or order.returnRequested
            item.returnStatus = order.returnStatus || 'none'; 
            
            // Push into a flat array for easy rendering
            allOrdersItem.push(item);
          });
        });

        // Reverse so newest items appear first
        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  // 2) Request return function
  // Calls backend: POST /api/order/return/:orderId with the user token
  const requestReturn = async (orderId) => {
    try {
      if (!token) return alert('Please log in to request a return.');

      const response = await axios.post(
        `${backendUrl}/api/order/return/${orderId}`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        alert('Return request submitted successfully.');
        // Reload orders so we see updated returnStatus
        loadOrderData();
      } else {
        alert(response.data.message || 'Failed to request return.');
      }
    } catch (error) {
      console.error('requestReturn error:', error);
      alert('Error requesting return. Please try again.');
    }
  };

  // 3) Download invoice
  const downloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/order/invoice/${orderId}`, {
        responseType: 'blob', // ensures the response is treated as a file
      });

      // Create a URL for the blob and open it in a new tab
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' })
      );
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing invoice:', error);
    }
  };

  // 4) Send invoice by email
  const sendInvoice = async (orderId, email) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/send-invoice`,
        { orderId, email },
        { headers: { token } }
      );

      if (response.data.success) {
        alert('Invoice emailed successfully!');
      } else {
        alert('Failed to email invoice.');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('An error occurred while sending the invoice.');
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

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
                    {item.price}
                  </p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                </div>
                <p className="mt-1">
                  Date:{' '}
                  <span className="text-gray-400">
                    {new Date(item.date).toDateString()}
                  </span>
                </p>
                <p className="mt-1">
                  Payment:{' '}
                  <span className="text-gray-400">{item.paymentMethod}</span>
                </p>
              </div>
            </div>

            {/* Right side: Status and Actions */}
            <div className="md:w-1/2 flex flex-col md:flex-row justify-between items-center gap-3">
              {/* Order status display */}
              <div className="flex items-center gap-2">
                <p
                  className={`min-w-2 h-2 rounded-full ${
                    item.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                ></p>
                <p className="text-sm md:text-base">{item.status}</p>
              </div>

              {/* If delivered, show invoice buttons + return logic */}
              {item.status === 'Delivered' && (
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
                  {item.returnStatus === 'none' && (
                    <button
                      onClick={() => requestReturn(item.orderId)}
                      className="border px-4 py-2 text-sm font-medium rounded-sm"
                    >
                      Request Return
                    </button>
                  )}

                  {/* Show if the user has already requested a return */}
                  {item.returnStatus === 'pending' && (
                    <span className="text-blue-500 text-sm font-medium">
                      Return Pending
                    </span>
                  )}

                  {/* If you want to show other states */}
                  {item.returnStatus === 'approved' && (
                    <span className="text-green-500 text-sm font-medium">
                      Return Approved
                    </span>
                  )}
                  {item.returnStatus === 'refunded' && (
                    <span className="text-green-500 text-sm font-medium">
                      Refunded
                    </span>
                  )}
                  {item.returnStatus === 'rejected' && (
                    <span className="text-red-500 text-sm font-medium">
                      Return Rejected
                    </span>
                  )}
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
