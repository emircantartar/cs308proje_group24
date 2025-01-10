import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
    wishlist = [], // Added support for wishlist array
  } = useContext(ShopContext);

  const logout = () => {
    // Clear user session
    navigate('/login');
    localStorage.removeItem('token');
    setToken('');
    setCartItems({});
  };

  // Fetch notifications from backend
  useEffect(() => {
    if (token) {
      const fetchNotifications = async () => {
        try {
          const response = await axios.get('/api/notifications', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            setNotifications(response.data.notifications);
            const unread = response.data.notifications.filter((n) => !n.isRead).length;
            setUnreadCount(unread);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };
      fetchNotifications();
    }
  }, [token]);

  // Mark notifications as read
  const markAsRead = async () => {
    try {
      await axios.put('/api/notifications/read', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      {/* Logo */}
      <Link to="/">
        <img src={assets.logo} className="w-36" alt="Shopilo Logo" />
      </Link>

      {/* Main Navigation for Desktop */}
      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>COLLECTION</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/wishlist" className="flex flex-col items-center gap-1">
          <p>WISHLIST</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
      </ul>

      {/* Right-Side Icons */}
      <div className="flex items-center gap-6">
        {/* Search Icon */}
        <img
          onClick={() => {
            setShowSearch(true);
            navigate('/collection');
          }}
          src={assets.search_icon}
          className="w-5 cursor-pointer"
          alt="Search"
        />

        {/* Notifications Icon */}
        <div className="relative group">
          <img
            src={assets.notification_icon}
            className="w-5 cursor-pointer"
            alt="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              markAsRead(); // Mark notifications as read when opened
            }}
          />
          {unreadCount > 0 && (
            <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-red-600 text-white aspect-square rounded-full text-[8px]">
              {unreadCount}
            </p>
          )}
          {showNotifications && (
            <div className="absolute top-8 right-0 w-80 bg-white shadow-lg rounded-lg p-4 z-50">
              <h3 className="font-bold text-gray-700 mb-2">Notifications</h3>
              <ul className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <li
                      key={notification._id}
                      className={`p-2 border-b ${
                        notification.isRead ? 'text-gray-500' : 'text-black'
                      }`}
                    >
                      {notification.message}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No notifications</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Profile Icon with Dropdown */}
        <div className="group relative">
          <img
            onClick={() => (token ? null : navigate('/login'))}
            className="w-5 cursor-pointer"
            src={assets.profile_icon}
            alt="Profile"
          />
          {token && (
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
                <p className="cursor-pointer hover:text-black">My Profile</p>
                <p
                  onClick={() => navigate('/orders')}
                  className="cursor-pointer hover:text-black"
                >
                  Orders
                </p>
                <p onClick={logout} className="cursor-pointer hover:text-black">
                  Logout
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cart Icon */}
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="Cart" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>

        {/* Wishlist Icon */}
        <Link to="/wishlist" className="relative">
          <img src={assets.wishlist_icon} className="w-5 min-w-5" alt="Wishlist" />
          {wishlist.length > 0 && (
            <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-red-600 text-white aspect-square rounded-full text-[8px]">
              {wishlist.length}
            </p>
          )}
        </Link>

        {/* Mobile Menu Icon */}
        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-5 cursor-pointer sm:hidden"
          alt="Menu"
        />
      </div>

      {/* Sidebar Menu for Small Screens */}
      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
          visible ? 'w-full' : 'w-0'
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-3 cursor-pointer"
          >
            <img
              className="h-4 rotate-180"
              src={assets.dropdown_icon}
              alt="Back"
            />
            <p>Back</p>
          </div>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/"
          >
            HOME
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/collection"
          >
            COLLECTION
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/wishlist"
          >
            WISHLIST
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
