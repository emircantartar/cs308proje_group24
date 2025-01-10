import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [editingStock, setEditingStock] = useState(null)
  const [newStockValue, setNewStockValue] = useState('')

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products.reverse());
      }
      else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const updateStock = async (productId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/update-stock`,
        { 
          productId, 
          quantity: Number(newStockValue)
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setEditingStock(null);
        setNewStockValue('');
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  const handleStockEdit = (productId, currentStock) => {
    setEditingStock(productId);
    setNewStockValue(currentStock?.toString() || '0');
  }

  const handleStockUpdate = (productId) => {
    if (newStockValue === '') {
      toast.error('Please enter a valid stock number');
      return;
    }
    updateStock(productId);
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <>
      <p className='mb-2'>All Products List</p>
      <div className='flex flex-col gap-2'>
        {/* ------- List Table Title ---------- */}
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Stock</b>
          <b className='text-center'>Action</b>
          <b className='text-center'>Remove</b>
        </div>

        {/* ------ Product List ------ */}
        {list.map((item, index) => (
          <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
            <img className='w-12' src={item.image[0]} alt="" />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{currency}{item.price}</p>
            <div>
              {editingStock === item._id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(e.target.value)}
                    className="w-20 px-2 py-1 border rounded"
                    min="0"
                  />
                  <button
                    onClick={() => handleStockUpdate(item._id)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setEditingStock(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <p
                  onClick={() => handleStockEdit(item._id, item.quantity)}
                  className="cursor-pointer hover:text-blue-600"
                >
                  {item.quantity || 0}
                </p>
              )}
            </div>
            <p className='text-center cursor-pointer text-blue-600 hover:text-blue-800' onClick={() => handleStockEdit(item._id, item.quantity)}>
              Edit Stock
            </p>
            <p onClick={() => removeProduct(item._id)} className='text-center cursor-pointer text-red-600 hover:text-red-800'>
              Remove
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

export default List