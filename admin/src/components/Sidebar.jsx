import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = ({ userRole }) => {
  return (
    <div className='w-[max(25vw,250px)] bg-white min-h-[90vh] py-8 px-4'>
      <div className='flex flex-col gap-2'>
        {/* Products List - only for product managers and admins */}
        {(userRole === 'product_manager' || userRole === 'admin') && (
          <NavLink to='/list' className={({ isActive }) => isActive ? 'bg-gray-100 p-4 rounded-lg' : 'p-4'}>
            Products List
          </NavLink>
        )}
        
        {/* Common links for all roles */}
        <NavLink to='/orders' className={({ isActive }) => isActive ? 'bg-gray-100 p-4 rounded-lg' : 'p-4'}>
          Orders
        </NavLink>

        {/* Product Manager specific links */}
        {(userRole === 'product_manager' || userRole === 'admin') && (
          <>
            <NavLink to='/add' className={({ isActive }) => isActive ? 'bg-gray-100 p-4 rounded-lg' : 'p-4'}>
              Add Product
            </NavLink>
            <NavLink to='/categories' className={({ isActive }) => isActive ? 'bg-gray-100 p-4 rounded-lg' : 'p-4'}>
              Categories
            </NavLink>
          </>
        )}

        {/* Sales Manager specific links */}
        {(userRole === 'sales_manager' || userRole === 'admin') && (
          <NavLink to='/sales-manager' className={({ isActive }) => isActive ? 'bg-gray-100 p-4 rounded-lg' : 'p-4'}>
            Sales Management
          </NavLink>
        )}
      </div>
    </div>
  )
}

export default Sidebar