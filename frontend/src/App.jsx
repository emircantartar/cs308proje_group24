import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Collection from './pages/Collection';
import About from './pages/About';
import Contact from './pages/Contact';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist'; // Added Wishlist
import Login from './pages/Login';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify';
import { useContext } from 'react';
import { ShopContext } from './context/ShopContext';
import Profile from './pages/Profile';

// Layout Component
const Layout = ({ children }) => (
  <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
    <ToastContainer />
    <Navbar />
    <SearchBar />
    {children}
    
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ element, redirectTo = '/login' }) => {
  const { token } = useContext(ShopContext);

  if (!token) {
    return <Navigate to={redirectTo} />;
  }

  return element;
};

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/collection"
        element={
          <Layout>
            <Collection />
          </Layout>
        }
      />
      <Route
        path="/about"
        element={
          <Layout>
            <About />
          </Layout>
        }
      />
      <Route
        path="/contact"
        element={
          <Layout>
            <Contact />
          </Layout>
        }
      />
      <Route
        path="/product/:productId"
        element={
          <Layout>
            <Product />
          </Layout>
        }
      />
      <Route
        path="/login"
        element={
          <Layout>
            <Login />
          </Layout>
        }
      />
      <Route
        path="/verify"
        element={
          <Layout>
            <Verify />
          </Layout>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/cart"
        element={
          <Layout>
            <ProtectedRoute element={<Cart />} />
          </Layout>
        }
      />
      <Route
        path="/wishlist"
        element={
          <Layout>
            <ProtectedRoute element={<Wishlist />} />
          </Layout>
        }
      />
      <Route
        path="/place-order"
        element={
          <Layout>
            <ProtectedRoute element={<PlaceOrder />} />
          </Layout>
        }
      />
      <Route
        path="/orders"
        element={
          <Layout>
            <ProtectedRoute element={<Orders />} />
          </Layout>
        }
      />
      <Route
        path="/profile"
        element={
          <Layout>
            <ProtectedRoute element={<Profile />} />
          </Layout>
        }
      />
    </Routes>
  );
};

export default App;
