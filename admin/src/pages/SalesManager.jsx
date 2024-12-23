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
  // State for discount management
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discountRate, setDiscountRate] = useState(0);
  const [newPrice, setNewPrice] = useState('');

  // State for invoice management
  const [invoices, setInvoices] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State for financial analytics
  const [revenueData, setRevenueData] = useState({
    dates: [],
    revenue: [],
    profit: [],
    costs: []
  });

  // Chart configuration
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
        intersect: false,
        callbacks: {
          label: function(context) {
            return `Revenue: ${currency}${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12
          },
          callback: function(value) {
            return `${currency}${value}`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  // Fetch products
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

  // Apply discount
  const handleApplyDiscount = async () => {
    try {
      if (!selectedProducts || selectedProducts.length === 0) {
        toast.error('Please select at least one product');
        return;
      }

      if (!discountRate || discountRate <= 0 || discountRate > 100) {
        toast.error('Please enter a valid discount rate between 1 and 100');
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/product/discount`,
        {
          productIds: selectedProducts,
          discountRate: parseFloat(discountRate)
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Discount applied successfully');
        // Refresh products list
        const updatedProducts = await axios.get(`${backendUrl}/api/product/list`);
        setProducts(updatedProducts.data.products);
        // Reset selection and discount rate
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

  // Remove discount
  const handleRemoveDiscount = async () => {
    try {
      if (!selectedProducts || selectedProducts.length === 0) {
        toast.error('Please select at least one product');
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/product/remove-discount`,
        {
          productIds: selectedProducts
        },
        { headers: { token } }
      );

      if (response.data.success) {
        // Show which products were updated
        if (response.data.updatedProducts.length > 0) {
          const updatedNames = response.data.updatedProducts.map(p => p.name).join(', ');
          toast.success(`Discounts removed from: ${updatedNames}`);
        } else {
          toast.info('No discounted products were selected');
        }

        // Refresh products list
        const updatedProducts = await axios.get(`${backendUrl}/api/product/list`);
        if (updatedProducts.data.success) {
          setProducts(updatedProducts.data.products);
          // Reset selection
          setSelectedProducts([]);
          setDiscountRate(0);
        }
      } else {
        toast.error(response.data.message || 'Error removing discounts');
      }
    } catch (error) {
      console.error('Remove discount error:', error);
      toast.error(error.response?.data?.message || 'Error removing discounts');
    }
  };

  // Set new base price
  const handleSetPrice = async () => {
    try {
      if (!selectedProducts || selectedProducts.length === 0) {
        toast.error('Please select at least one product');
        return;
      }

      if (!newPrice || newPrice <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/product/set-price`,
        {
          productIds: selectedProducts,
          newPrice: parseFloat(newPrice)
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Price updated successfully');
        // Refresh products list
        const updatedProducts = await axios.get(`${backendUrl}/api/product/list`);
        if (updatedProducts.data.success) {
          setProducts(updatedProducts.data.products);
          // Reset selection and price
          setSelectedProducts([]);
          setNewPrice('');
        }
      } else {
        toast.error(response.data.message || 'Error updating price');
      }
    } catch (error) {
      console.error('Price update error:', error);
      toast.error(error.response?.data?.message || 'Error updating price');
    }
  };

  // Fetch invoices
  const handleFetchInvoices = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/invoices`,
        {
          startDate,
          endDate
        },
        { headers: { token } }
      );
      if (response.data.success) {
        setInvoices(response.data.invoices);
      }
    } catch (error) {
      toast.error('Error fetching invoices');
    }
  };

  // Generate PDF
  const handleGeneratePDF = async (orderId) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/order/invoice/${orderId}`,
        {
          headers: { 
            token,
            'Accept': 'application/pdf'
          },
          responseType: 'blob'
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Error generating PDF');
    }
  };

  // Fetch financial data
  const handleFetchFinancialData = async () => {
    try {
      if (!startDate || !endDate) {
        toast.error('Please select both start and end dates');
        return;
      }

      console.log('Fetching financial data for:', { startDate, endDate });
      
      const response = await axios.post(
        `${backendUrl}/api/order/analytics/revenue`,
        {
          startDate,
          endDate
        },
        { headers: { token } }
      );

      console.log('Financial data response:', response.data);

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

  return (
    <div className="p-4">
      {/* Discount Management Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Discount Management</h2>
        <div className="flex gap-4 mb-4">
          <select
            multiple
            className="border p-2 rounded w-96"
            onChange={(e) => setSelectedProducts(Array.from(e.target.selectedOptions, option => option.value))}
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
                  <>Original: {currency}{product.originalPrice?.toFixed(2)} | Discounted: {currency}{product.price?.toFixed(2)} ({product.discountRate}% off)</>
                ) : (
                  <>Price: {currency}{product.price?.toFixed(2)}</>
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
              value={newPrice}
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

      {/* Invoice Management Section */}
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
            <div key={invoice._id} className="border p-4 rounded mb-2 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div>
                <p>Order ID: {invoice.orderId}</p>
                <p>Date: {new Date(invoice.date).toLocaleDateString()}</p>
                <p>Total: {currency}{invoice.total}</p>
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

      {/* Financial Analytics Section */}
      <div>
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
        <div className="mt-4">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="h-[400px]">
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {revenueData.dates.map((date, index) => (
                <div key={date} className="border p-4 rounded bg-gray-50">
                  <p className="font-semibold">Date: {new Date(date).toLocaleDateString()}</p>
                  <p className="text-lg text-green-600">Revenue: {currency}{revenueData.revenue[index]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesManager; 