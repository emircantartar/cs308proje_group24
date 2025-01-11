import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const ProductManager = ({ token }) => {
  // State for category management
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // State for stock management
  const [products, setProducts] = useState([]);
  const [stockUpdates, setStockUpdates] = useState({});

  // State for delivery management
  const [deliveries, setDeliveries] = useState([]);

  // State for comment management
  const [comments, setComments] = useState([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/product/categories`);
        if (response.data.success) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        toast.error('Error fetching categories');
      }
    };
    fetchCategories();
  }, []);

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

  // Fetch deliveries
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/delivery/list`,
          { headers: { token } }
        );
        if (response.data.success) {
          setDeliveries(response.data.deliveries);
        }
      } catch (error) {
        toast.error('Error fetching deliveries');
      }
    };
    fetchDeliveries();
  }, [token]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/product/comments/pending`,
          { headers: { token } }
        );
        if (response.data.success) {
          setComments(response.data.comments);
        }
      } catch (error) {
        toast.error('Error fetching comments');
      }
    };
    fetchComments();
  }, [token]);

  // Add category
  const handleAddCategory = async () => {
    try {
      // Split and clean subcategories
      const subCategoriesArray = newCategory.split(',')
        .map(cat => cat.trim())
        .filter(cat => cat !== '');

      const response = await axios.post(
        `${backendUrl}/api/product/category/add`,
        { 
          category: newCategory,
          subCategories: subCategoriesArray 
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Category added successfully');
        setCategories([...categories, response.data.category]);
        setNewCategory('');
      }
    } catch (error) {
      toast.error('Error adding category');
    }
  };

  // Remove category
  const handleRemoveCategory = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/category/remove`,
        { id: selectedCategory },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Category removed successfully');
        setCategories(categories.filter(cat => cat._id !== selectedCategory));
        setSelectedCategory('');
      }
    } catch (error) {
      toast.error('Error removing category');
    }
  };

  // Update stock
  const handleUpdateStock = async (productId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/stock/update`,
        {
          productId,
          quantity: stockUpdates[productId]
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Stock updated successfully');
        // Refresh products list
        const updatedProducts = await axios.get(`${backendUrl}/api/product/list`);
        setProducts(updatedProducts.data.products);
        setStockUpdates({ ...stockUpdates, [productId]: '' });
      }
    } catch (error) {
      toast.error('Error updating stock');
    }
  };

  // Update delivery status
  const handleUpdateDeliveryStatus = async (deliveryId, status) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/delivery/update-status`,
        {
          deliveryId,
          status
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Delivery status updated successfully');
        setDeliveries(deliveries.map(delivery => 
          delivery._id === deliveryId ? { ...delivery, status } : delivery
        ));
      }
    } catch (error) {
      toast.error('Error updating delivery status');
    }
  };

  // Moderate comment
  const handleModerateComment = async (commentId, approved) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/comment/moderate`,
        {
          commentId,
          approved
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Comment moderated successfully');
        setComments(comments.filter(comment => comment._id !== commentId));
      }
    } catch (error) {
      toast.error('Error moderating comment');
    }
  };

  return (
    <div className="p-4">
      {/* Category Management Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Category Management</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            className="border p-2 rounded"
            placeholder="New Category Name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleAddCategory}
          >
            Add Category
          </button>
        </div>
        <div className="flex gap-4">
          <select
            className="border p-2 rounded"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select Category to Remove</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={handleRemoveCategory}
          >
            Remove Category
          </button>
        </div>
      </div>

      {/* Stock Management Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Stock Management</h2>
        <div className="grid gap-4">
          {products.map(product => (
            <div key={product._id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <p className="font-bold">{product.name}</p>
                <p>Current Stock: {product.quantity}</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="border p-2 rounded w-24"
                  placeholder="Quantity"
                  value={stockUpdates[product._id] || ''}
                  onChange={(e) => setStockUpdates({
                    ...stockUpdates,
                    [product._id]: e.target.value
                  })}
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => handleUpdateStock(product._id)}
                >
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Management Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Delivery Management</h2>
        <div className="grid gap-4">
          {deliveries.map(delivery => (
            <div key={delivery._id} className="border p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p>Delivery ID: {delivery._id}</p>
                  <p>Customer ID: {delivery.customerId}</p>
                  <p>Product ID: {delivery.productId}</p>
                  <p>Quantity: {delivery.quantity}</p>
                  <p>Total Price: {currency}{Number(delivery.totalPrice).toFixed(2)}</p>
                  <p>Address: {delivery.deliveryAddress}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`px-4 py-2 rounded ${
                      delivery.status === 'completed'
                        ? 'bg-gray-500'
                        : 'bg-green-500'
                    } text-white`}
                    onClick={() => handleUpdateDeliveryStatus(delivery._id, 'completed')}
                    disabled={delivery.status === 'completed'}
                  >
                    Mark as Completed
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comment Moderation Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Comment Moderation</h2>
        <div className="grid gap-4">
          {comments.map(comment => (
            <div key={comment._id} className="border p-4 rounded">
              <p className="font-bold">Product: {comment.productName}</p>
              <p className="mb-2">{comment.content}</p>
              <div className="flex gap-2">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={() => handleModerateComment(comment._id, true)}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => handleModerateComment(comment._id, false)}
                >
                  Disapprove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductManager; 