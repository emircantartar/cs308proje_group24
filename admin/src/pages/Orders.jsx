import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  // Handle refund
  const handleRefund = async (orderId, amount) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/refund`,
        { 
          orderId, 
          refundAmount: amount 
        },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      if (response.data.success) {
        toast.success('Refund processed successfully');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || 'Failed to process refund');
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Error processing refund');
      }
    }
  };

  // Fetch all orders
  const fetchAllOrders = async () => {
    if (!token) return null;

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      if (response.data.success) {
        console.log('Orders data:', response.data.orders); // Debug log
        const processedOrders = response.data.orders.map(order => ({
          ...order,
          amount: order.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
          }, 0) + 10,
          returnStatus: order.returnStatus || 'none',
          refundAmount: order.refundAmount || null
        }));
        setOrders(processedOrders.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Error fetching orders');
      }
    }
  };

  // Update shipping status
  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: event.target.value },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      if (response.data.success) {
        await fetchAllOrders();
        toast.success('Order status updated successfully');
      }
    } catch (error) {
      if (error.response?.status !== 401) {  // Don't show error for 401 as it's handled by interceptor
        toast.error(error.response?.data?.message || 'Error updating order status');
      }
    }
  };

  // Download Invoice
  const downloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/order/invoice/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      if (error.response?.status !== 401) {  // Don't show error for 401 as it's handled by interceptor
        toast.error('Error downloading invoice.');
      }
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {orders.map((order, index) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] 
                       lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr]
                       gap-3 items-start border-2 border-gray-200 
                       p-5 md:p-8 my-3 md:my-4 text-xs 
                       sm:text-sm text-gray-700"
            key={index}
          >
            <img className="w-12" src={assets.parcel_icon} alt="" />

            {/* Items & Address */}
            <div>
              <div>
                {order.items.map((item, i) => {
                  const comma = i === order.items.length - 1 ? '' : ',';
                  const discountedPrice = item.discountRate ? 
                    (item.price * (1 - item.discountRate/100)) : 
                    item.price;
                  return (
                    <p className="py-0.5" key={i}>
                      {item.name} x {item.quantity} <span>{item.size}</span>
                      {item.discountRate ? (
                        <span className="text-red-600">
                          {' '}(Original: {currency}{parseFloat(item.originalPrice).toFixed(2)}, 
                          Discounted: {currency}{parseFloat(item.price).toFixed(2)})
                        </span>
                      ) : (
                        <span> ({currency}{parseFloat(item.price).toFixed(2)})</span>
                      )}
                      {comma}
                    </p>
                  );
                })}
              </div>
              <p className="mt-3 mb-2 font-medium">
                {order.address.firstName + ' ' + order.address.lastName}
              </p>
              <div>
                <p>{order.address.street + ','}</p>
                <p>
                  {order.address.city + ', ' + order.address.state + ', ' + order.address.country + ', ' + order.address.zipcode}
                </p>
              </div>
              <p>{order.address.phone}</p>
            </div>

            {/* Order details */}
            <div>
              <p className="text-sm sm:text-[15px]">Items: {order.items.length}</p>
              <p className="mt-3">Method: {order.paymentMethod}</p>
              <p>Payment: {order.payment ? 'Done' : 'Pending'}</p>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>

            {/* Amount */}
            <p className="text-sm sm:text-[15px]">
              Subtotal: {currency}{parseFloat(order.items.reduce((total, item) => total + (item.price * item.quantity), 0)).toFixed(2)}<br />
              Shipping: {currency}10.00<br />
              Total: {currency}{parseFloat(order.amount).toFixed(2)}
            </p>

            {/* Shipping Status */}
            <select
              onChange={(event) => statusHandler(event, order._id)}
              value={order.status}
              className="p-2 font-semibold"
            >
              <option value="Order Placed">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>

            {/* Return and Refund Status */}
            <div className="mt-2">
              {order.returnStatus && (
                <div className="text-sm">
                  <p>Return Status: <span className={
                    order.returnStatus === 'approved' ? 'text-green-600' :
                    order.returnStatus === 'rejected' ? 'text-red-600' :
                    order.returnStatus === 'refunded' ? 'text-green-600' :
                    'text-blue-600'
                  }>{order.returnStatus}</span></p>
                  
                  {order.refundAmount ? (
                    <p className="mt-1">Refunded Amount: {currency}{parseFloat(order.refundAmount).toFixed(2)}</p>
                  ) : order.returnStatus === 'approved' && (
                    <button
                      onClick={() => handleRefund(order._id, order.items.reduce((total, item) => total + (item.price * item.quantity), 0) + 10)}
                      className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Process Refund
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Download Invoice Button */}
            <button
              onClick={() => downloadInvoice(order._id)}
              className="mt-2 sm:mt-0 px-4 py-2 text-sm font-medium border rounded-sm"
            >
              View Invoice
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
