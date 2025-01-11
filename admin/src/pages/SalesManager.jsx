import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SalesManager = ({ token }) => {
  // ---------------------
  // State for discount management
  // ---------------------
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discountRate, setDiscountRate] = useState(0);
  const [newPrice, setNewPrice] = useState('');

  // ---------------------
  // State for invoice management
  // ---------------------
  const [invoices, setInvoices] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ---------------------
  // State for financial analytics
  // ---------------------
  const [revenueData, setRevenueData] = useState({
    dates: [],
    revenue: [],
    profit: [],
    costs: []
  });

  // ---------------------
  // State for return/refund management
  // ---------------------
  const [returns, setReturns] = useState([]);

  // ---------------------
  // Chart configuration
  // ---------------------
  const chartData = {
    labels: revenueData.dates.map(date => new Date(date).toLocaleDateString()),
    datasets: [
      {
        label: 'Revenue',
        data: revenueData.revenue,
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      },
      {
        label: 'Profit/Loss',
        data: revenueData.profit,
        fill: true,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4
      },
      {
        label: 'Costs',
        data: revenueData.costs,
        fill: true,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'Revenue Over Time',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: {
          font: { size: 12 },
          callback: value => `${currency}${value}`
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  // ----------------------------------------------------
  // 1) DISCOUNT MANAGEMENT
  // ----------------------------------------------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/product/list`);
        if (response.data.success) {
          setProducts(response.data.products);
        }
      } catch (error) {
        toast.error('Error fetching products');
      }
    };
    fetchProducts();
  }, []);

  // Refresh products in frontend
  const refreshProducts = async () => {
    try {
      // Emit a custom event that ShopContext will listen to
      const event = new CustomEvent('refreshProducts');
      window.dispatchEvent(event);
      
      // Also refresh local products
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  };

  const handleApplyDiscount = async () => {
    try {
      if (!selectedProducts.length) {
        toast.error('Please select at least one product');
        return;
      }
      if (!discountRate || discountRate <= 0 || discountRate > 100) {
        toast.error('Please enter a valid discount rate between 1 and 100');
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/product/discount`,
        { productIds: selectedProducts, discountRate: parseFloat(discountRate) },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Discount applied successfully');
        await refreshProducts(); // Refresh products after discount
        setSelectedProducts([]);
        setDiscountRate(0);
      } else {
        toast.error(response.data.message || 'Error applying discount');
      }
    } catch (error) {
      console.error('Discount error:', error);
      toast.error(error.response?.data?.message || 'Error applying discount');
    }
  };

  const handleRemoveDiscount = async () => {
    try {
      if (!selectedProducts.length) {
        toast.error('Please select at least one product');
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/product/remove-discount`,
        { productIds: selectedProducts },
        { headers: { token } }
      );

      if (response.data.success) {
        if (response.data.updatedProducts.length) {
          const updatedNames = response.data.updatedProducts.map(p => p.name).join(', ');
          toast.success(`Discounts removed from: ${updatedNames}`);
        } else {
          toast.info('No discounted products were selected');
        }
        await refreshProducts(); // Refresh products after removing discount
        setSelectedProducts([]);
        setDiscountRate(0);
      } else {
        toast.error(response.data.message || 'Error removing discounts');
      }
    } catch (error) {
      console.error('Remove discount error:', error);
      toast.error(error.response?.data?.message || 'Error removing discounts');
    }
  };

  const handleSetPrice = async () => {
    try {
      if (!selectedProducts.length) {
        toast.error('Please select at least one product');
        return;
      }
      if (!newPrice || newPrice <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/product/set-price`,
        { productIds: selectedProducts, newPrice: parseFloat(newPrice) },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Price updated successfully');
        await refreshProducts(); // Refresh products after price update
        setSelectedProducts([]);
        setNewPrice('');
      } else {
        toast.error(response.data.message || 'Error updating price');
      }
    } catch (error) {
      console.error('Price update error:', error);
      toast.error(error.response?.data?.message || 'Error updating price');
    }
  };

  // ----------------------------------------------------
  // 2) INVOICE MANAGEMENT
  // ----------------------------------------------------
  const handleFetchInvoices = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/invoices`,
        { startDate, endDate },
        { headers: { token } }
      );
      if (response.data.success) {
        setInvoices(response.data.invoices);
      }
    } catch (error) {
      toast.error('Error fetching invoices');
    }
  };

  const handleGeneratePDF = async (orderId) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/order/invoice/${orderId}`,
        {
          headers: { token, Accept: 'application/pdf' },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Error generating PDF');
    }
  };

  // ----------------------------------------------------
  // 3) FINANCIAL ANALYTICS
  // ----------------------------------------------------
  const handleFetchFinancialData = async () => {
    try {
      if (!startDate || !endDate) {
        toast.error('Please select both start and end dates');
        return;
      }
      const response = await axios.post(
        `${backendUrl}/api/order/analytics/revenue`,
        { startDate, endDate },
        { headers: { token } }
      );
      if (response.data.success) {
        if (response.data.dates.length === 0) {
          toast.info('No financial data found for the selected date range');
          return;
        }
        setRevenueData({
          dates: response.data.dates,
          revenue: response.data.revenue,
          profit: response.data.profit,
          costs: response.data.costs
        });
        toast.success('Financial report generated successfully');
      } else {
        toast.error(response.data.message || 'Error generating financial report');
      }
    } catch (error) {
      console.error('Financial data error:', error);
      toast.error(error.response?.data?.message || 'Error fetching financial data');
    }
  };

  // ----------------------------------------------------
  // 4) RETURN/REFUND MANAGEMENT
  // ----------------------------------------------------
  const handleFetchReturns = async () => {
    try {
      // Remove the status filter to get all returns
      const response = await axios.get(`${backendUrl}/api/order/returns`, {
        headers: { token }
      });
      if (response.data.success) {
        setReturns(response.data.returns);
      } else {
        toast.error(response.data.message || 'Failed to fetch return requests');
      }
    } catch (error) {
      console.error('Fetch returns error:', error);
      toast.error(error.response?.data?.message || 'Error fetching returns');
    }
  };

  // Approve or Decline the return
  const handleUpdateReturnStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(
        `${backendUrl}/api/order/return/${orderId}`,
        { 
          status: newStatus,
          skipRefund: true // Add this flag to prevent automatic refund
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(`Return status updated to '${newStatus}'`);
        
        // If return is approved, update the product stock
        if (newStatus === 'approved') {
          try {
            // Get the return details to find the product and quantity
            const returnResponse = await axios.get(
              `${backendUrl}/api/order/return/${orderId}`,
              { headers: { token } }
            );
            
            if (returnResponse.data.success && returnResponse.data.order) {
              const orderData = returnResponse.data.order;
              // Update stock for each item in the order
              for (const item of orderData.items) {
                const stockResponse = await axios.post(
                  `${backendUrl}/api/product/update-stock-return`,
                  {
                    productId: item._id,
                    returnedQuantity: item.quantity
                  },
                  { headers: { token } }
                );

                if (stockResponse.data.success) {
                  toast.success('Product stock updated successfully');
                }
              }
            }
          } catch (error) {
            console.error('Error updating stock:', error);
            toast.error('Error updating product stock');
          }
        }

        handleFetchReturns(); // Refresh the list to see updated statuses
      } else {
        toast.error(response.data.message || 'Failed to update return status');
      }
    } catch (error) {
      console.error('Update return status error:', error);
      toast.error(error.response?.data?.message || 'Error updating return status');
    }
  };

  // Handle refund separately
  const handleRefund = async (returnId, amount) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/refund`,
        { 
          returnId,
          refundAmount: amount 
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Refund processed successfully');
        // Update the return status to refunded
        await handleUpdateReturnStatus(returnId, 'refunded');
        handleFetchReturns(); // Refresh returns list
      } else {
        toast.error(response.data.message || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Refund error:', error);
      toast.error(error.response?.data?.message || 'Error processing refund');
    }
  };

  return (
    <div className="p-4">
      {/* DISCOUNT MANAGEMENT SECTION */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Discount Management</h2>
        <div className="flex gap-4 mb-4">
          <select
            multiple
            className="border p-2 rounded w-96"
            onChange={(e) =>
              setSelectedProducts(Array.from(e.target.selectedOptions, option => option.value))
            }
            value={selectedProducts}
          >
            {products.map(product => (
              <option
                key={product._id}
                value={product._id}
                className={product.discountRate ? 'text-red-600' : ''}
              >
                {product.name} -
                {product.discountRate ? (
                  <>
                    Original: {currency}
                    {Number(product.originalPrice).toFixed(2)} | Discounted:{' '}
                    {currency}
                    {Number(product.price).toFixed(2)} ({product.discountRate}% off)
                  </>
                ) : (
                  <>
                    Price: {currency}
                    {Number(product.price).toFixed(2)}
                  </>
                )}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              className="border p-2 rounded w-32"
              placeholder="New Price"
              value={Number(newPrice).toFixed(2)}
              onChange={(e) => setNewPrice(e.target.value)}
            />
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              onClick={handleSetPrice}
            >
              Set Price
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="100"
              className="border p-2 rounded w-32"
              placeholder="Discount %"
              value={discountRate}
              onChange={(e) => setDiscountRate(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              onClick={handleApplyDiscount}
            >
              Apply Discount
            </button>
          </div>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            onClick={handleRemoveDiscount}
          >
            Remove Discount
          </button>
        </div>
      </div>

      {/* INVOICE MANAGEMENT SECTION */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Invoice Management</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="date"
            className="border p-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="border p-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            onClick={handleFetchInvoices}
          >
            Fetch Invoices
          </button>
        </div>
        <div className="mt-4">
          {invoices.map(invoice => (
            <div
              key={invoice._id}
              className="border p-4 rounded mb-2 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div>
                <p>Order ID: {invoice.orderId}</p>
                <p>Date: {new Date(invoice.date).toLocaleDateString()}</p>
                <p>Subtotal: {currency}{Number(invoice.total - 10).toFixed(2)}</p>
                <p>Shipping: {currency}10.00</p>
                <p>Total: {currency}{Number(invoice.total).toFixed(2)}</p>
              </div>
              <button
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
                onClick={() => handleGeneratePDF(invoice._id)}
              >
                Download PDF
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FINANCIAL ANALYTICS SECTION */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Financial Analytics</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="date"
            className="border p-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="border p-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
            onClick={handleFetchFinancialData}
          >
            Generate Report
          </button>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div className="h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {revenueData.dates.map((date, index) => (
              <div key={date} className="border p-4 rounded bg-gray-50">
                <p className="font-semibold">
                  Date: {new Date(date).toLocaleDateString()}
                </p>
                <p className="text-lg text-green-600">
                  Revenue: {currency}{Number(revenueData.revenue[index]).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RETURN / REFUND MANAGEMENT SECTION */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Return / Refund Management</h2>
        <div className="flex gap-4 mb-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            onClick={handleFetchReturns}
          >
            Fetch All Returns
          </button>
        </div>
        <div>
          {returns.map((ret) => (
            <div key={ret._id} className="border p-4 rounded mb-2">
              <p className="font-semibold mb-1">Return ID: {ret._id}</p>
              <p>Order ID: {ret.orderId || (ret.order && ret.order._id)}</p>
              <p>User: {ret.user && ret.user.email}</p>
              <p>Status: <span className={
                ret.returnStatus === 'approved' ? 'text-green-600' :
                ret.returnStatus === 'rejected' ? 'text-red-600' :
                ret.returnStatus === 'refunded' ? 'text-green-600' :
                'text-blue-600'
              }>{ret.returnStatus || 'unknown'}</span></p>
              {ret.refundAmount && (
                <p>Refund Amount: {currency}{Number(ret.refundAmount).toFixed(2)}</p>
              )}

              {/* Status management buttons */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleUpdateReturnStatus(ret._id, 'approved')}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  disabled={ret.returnStatus === 'refunded' || ret.returnStatus === 'approved'}
                >
                  Approve Return
                </button>
                <button
                  onClick={() => handleUpdateReturnStatus(ret._id, 'rejected')}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  disabled={ret.returnStatus === 'refunded' || ret.returnStatus === 'rejected'}
                >
                  Reject Return
                </button>
              </div>

              {/* Show refund processed status only when refund is processed */}
              {ret.returnStatus === 'refunded' && ret.refundAmount && (
                <p className="mt-2">
                  <span className="text-green-600 font-medium">✓ Refund Processed</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesManager;
