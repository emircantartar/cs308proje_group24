import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Categories = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newSubCategories, setNewSubCategories] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedSubCategories, setEditedSubCategories] = useState('');

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/categories`);
      if (response.data.success) {
        setCategories(response.data.categories);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Error fetching categories');
    }
  };

  // Add new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const subCategoriesArray = newSubCategories
        .split(',')
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
        toast.success(response.data.message);
        setNewCategory('');
        setNewSubCategories('');
        fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Error adding category');
    }
  };

  // Update category
  const handleUpdateCategory = async (oldCategory) => {
    try {
      const subCategoriesArray = editedSubCategories
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat !== '');

      const response = await axios.post(
        `${backendUrl}/api/product/category/update`,
        {
          oldCategory,
          newCategory: editedName,
          subCategories: subCategoriesArray
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setEditingCategory(null);
        fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Error updating category');
    }
  };

  // Delete category
  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Are you sure you want to delete ${category} and all its products?`)) {
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/product/category/delete`,
        { category },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Error deleting category');
    }
  };

  // Start editing a category
  const startEditing = (category) => {
    setEditingCategory(category.category);
    setEditedName(category.category);
    setEditedSubCategories(category.subCategories.join(', '));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Category Management</h2>

      {/* Add New Category Form */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
        <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sub-Categories (comma-separated)
            </label>
            <input
              type="text"
              value={newSubCategories}
              onChange={(e) => setNewSubCategories(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              placeholder="e.g. Sub1, Sub2, Sub3"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Category
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 p-4 font-semibold border-b">
          <div>Category</div>
          <div>Sub-Categories</div>
          <div className="text-center">Products</div>
          <div className="text-center">Actions</div>
        </div>
        {categories.map((category) => (
          <div key={category.category} className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 p-4 border-b items-center">
            {editingCategory === category.category ? (
              <>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="border rounded p-1"
                />
                <input
                  type="text"
                  value={editedSubCategories}
                  onChange={(e) => setEditedSubCategories(e.target.value)}
                  className="border rounded p-1"
                />
                <div className="text-center">{category.count}</div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleUpdateCategory(category.category)}
                    className="text-green-600 hover:text-green-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>{category.category}</div>
                <div>{category.subCategories.join(', ')}</div>
                <div className="text-center">{category.count}</div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => startEditing(category)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.category)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories; 