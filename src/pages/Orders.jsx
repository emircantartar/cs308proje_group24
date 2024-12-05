import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item['status'] = order.status;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date;
            item['orderId'] = order._id; // Add orderId for invoice functionality
            allOrdersItem.push(item);
          });
        });
        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/order/invoice/${orderId}`, {
        responseType: 'blob', // Ensure the response is treated as a file
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
      console.error(error);
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
            <div className="flex items-start gap-6 text-sm">
              <img className="w-16 sm:w-20" src={item.image[0]} alt="" />
              <div>
                <p className="sm:text-base font-medium">{item.name}</p>
                <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                  <p>{currency}{item.price}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                </div>
                <p className="mt-1">
                  Date: <span className="text-gray-400">{new Date(item.date).toDateString()}</span>
                </p>
                <p className="mt-1">
                  Payment: <span className="text-gray-400">{item.paymentMethod}</span>
                </p>
              </div>
            </div>

            <div className="md:w-1/2 flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <p
                  className={`min-w-2 h-2 rounded-full ${
                    item.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                ></p>
                <p className="text-sm md:text-base">{item.status}</p>
              </div>
              {item.status === 'Delivered' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => downloadInvoice(item.orderId)}
                    className="border px-4 py-2 text-sm font-medium rounded-sm"
                  >
                    View Invoice
                  </button>
                  <button
                    onClick={() => sendInvoice(item.orderId, item.email)} // Pass the user's email
                    className="border px-4 py-2 text-sm font-medium rounded-sm"
                  >
                    Email Invoice
                  </button>
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
