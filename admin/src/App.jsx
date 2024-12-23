import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import SalesManager from './pages/SalesManager'
import ProductManager from './pages/ProductManager'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '$'

const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole')?localStorage.getItem('userRole'):'');

  useEffect(()=>{
    localStorage.setItem('token',token)
    localStorage.setItem('userRole',userRole)
  },[token, userRole])

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {token === ""
        ? <Login setToken={setToken} setUserRole={setUserRole} />
        : <>
          <Navbar setToken={setToken} setUserRole={setUserRole} />
          <hr />
          <div className='flex w-full'>
            <Sidebar userRole={userRole} />
            <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
              <Routes>
                <Route path='/add' element={<Add token={token} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/orders' element={<Orders token={token} />} />
                <Route path='/sales-manager' element={<SalesManager token={token} />} />
                <Route path='/product-manager' element={<ProductManager token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      }
    </div>
  )
}

export default App