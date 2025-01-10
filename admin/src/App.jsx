import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import SalesManager from './pages/SalesManager'
import ProductManager from './pages/ProductManager'
import Login from './components/Login'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '$'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');

  // Add axios interceptor for handling 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear token and role on unauthorized
          setToken('');
          setUserRole('');
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          toast.error('Session expired. Please login again.');
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', userRole);

    // Set default authorization header
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token, userRole]);

  // Protected Route component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!token) {
      return <Navigate to="/" replace />;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {!token ? (
        <Login setToken={setToken} setUserRole={setUserRole} />
      ) : (
        <>
          <Navbar setToken={setToken} setUserRole={setUserRole} />
          <hr />
          <div className='flex w-full'>
            <Sidebar userRole={userRole} />
            <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
              <Routes>
                <Route
                  path='/add'
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'product_manager']}>
                      <Add token={token} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/list'
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'product_manager']}>
                      <List token={token} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/orders'
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'sales_manager', 'product_manager']}>
                      <Orders token={token} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/sales-manager'
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'sales_manager']}>
                      <SalesManager token={token} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/product-manager'
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ProductManager token={token} />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;