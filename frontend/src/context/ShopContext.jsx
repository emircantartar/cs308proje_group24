import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '$';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token') || '')
    const navigate = useNavigate();

    // Add axios interceptor for handling 401 errors
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Clear token and redirect to login
                    setToken('');
                    localStorage.removeItem('token');
                    navigate('/login');
                    toast.error('Session expired. Please login again.');
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, [navigate]);

    // Add event listener for product refreshes
    useEffect(() => {
        const handleRefreshProducts = () => {
            getProductsData();
        };

        window.addEventListener('refreshProducts', handleRefreshProducts);
        return () => {
            window.removeEventListener('refreshProducts', handleRefreshProducts);
        };
    }, []);

    const addToCart = async (itemId, size) => {
        if (!size) {
            toast.error('Select Product Size');
            return;
        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            }
            else {
                cartData[itemId][size] = 1;
            }
        }
        else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(
                    `${backendUrl}/api/cart/add`, 
                    { itemId, size },
                    { 
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        } 
                    }
                );
            } catch (error) {
                if (error.response?.status !== 401) {  // Don't show error for 401 as it's handled by interceptor
                    toast.error(error.response?.data?.message || 'Error adding to cart');
                }
            }
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(
                    `${backendUrl}/api/cart/update`,
                    { itemId, size, quantity },
                    { 
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        } 
                    }
                );
            } catch (error) {
                if (error.response?.status !== 401) {  // Don't show error for 401 as it's handled by interceptor
                    toast.error(error.response?.data?.message || 'Error updating cart');
                }
            }
        }
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalAmount += itemInfo.price * cartItems[items][item];
                    }
                } catch (error) {
                    console.error('Error calculating cart amount:', error);
                }
            }
        }
        return totalAmount;
    }

    const getProductsData = async () => {
        try {

            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                setProducts(response.data.products.reverse())
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getUserCart = async (token) => {
        if (!token) return;
        
        try {
            console.log('Fetching cart with token:', token);
            const response = await axios.post(
                `${backendUrl}/api/cart/get`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Cart response:', response.data);
            if (response.data.success) {
                // Convert cartItems array to the expected format
                const cartData = {};
                response.data.cartItems.forEach(item => {
                    if (!cartData[item._id]) {
                        cartData[item._id] = {};
                    }
                    cartData[item._id][item.size] = item.cartQuantity;
                });
                console.log('Converted cart data:', cartData);
                setCartItems(cartData);
            }
        } catch (error) {
            console.error('Cart fetch error:', error.response || error);
            if (error.response?.status !== 401) {  // Don't show error for 401 as it's handled by interceptor
                toast.error(error.response?.data?.message || 'Error fetching cart');
            }
        }
    }

    useEffect(() => {
        getProductsData()
    }, [])

    useEffect(() => {
        if (token) {
            getUserCart(token)
        } else {
            setCartItems({});  // Clear cart when no token
        }
    }, [token])

    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;