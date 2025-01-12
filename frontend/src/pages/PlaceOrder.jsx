import React, { useContext, useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
    const [method, setMethod] = useState('cod');
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: '',
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData((data) => ({ ...data, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            let orderItems = [];

            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        const itemInfo = structuredClone(products.find((product) => product._id === items));
                        if (itemInfo) {
                            itemInfo.size = item;
                            itemInfo.quantity = cartItems[items][item];
                            orderItems.push(itemInfo);
                        }
                    }
                }
            }

            let orderData = {
                address: formData,
                items: orderItems,
                amount: getCartAmount() + delivery_fee,
                paymentMethod: method,
            };

            // API Call for placing order
            const response = await axios.post(
                `${backendUrl}/api/order/place`, 
                orderData, 
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );

            if (response.data.success) {
                toast.success('Order placed successfully!');
                setCartItems({});
                navigate('/orders');
            } else {
                toast.error(response.data.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Order placement error:', error);
            // Don't show error for 401 as it's handled by interceptor
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.message || 'Error placing order. Please try again.');
            }
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
            {/* ------------- Left Side ---------------- */}
            <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
                <div className="text-xl sm:text-2xl my-3">
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>
                <div className="flex gap-3">
                    <input
                        required
                        onChange={onChangeHandler}
                        name="firstName"
                        value={formData.firstName}
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                        type="text"
                        placeholder="First name"
                    />
                    <input
                        required
                        onChange={onChangeHandler}
                        name="lastName"
                        value={formData.lastName}
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                        type="text"
                        placeholder="Last name"
                    />
                </div>
                <input
                    required
                    onChange={onChangeHandler}
                    name="email"
                    value={formData.email}
                    className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                    type="email"
                    placeholder="Email address"
                />
                <input
                    required
                    onChange={onChangeHandler}
                    name="street"
                    value={formData.street}
                    className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                    type="text"
                    placeholder="Street"
                />
                <div className="flex gap-3">
                    <input
                        required
                        onChange={onChangeHandler}
                        name="city"
                        value={formData.city}
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                        type="text"
                        placeholder="City"
                    />
                    <input
                        onChange={onChangeHandler}
                        name="state"
                        value={formData.state}
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                        type="text"
                        placeholder="State"
                    />
                </div>
                <div className="flex gap-3">
                    <input
                        required
                        onChange={onChangeHandler}
                        name="zipcode"
                        value={formData.zipcode}
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                        type="number"
                        placeholder="Zipcode"
                    />
                    <input
                        required
                        onChange={onChangeHandler}
                        name="country"
                        value={formData.country}
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                        type="text"
                        placeholder="Country"
                    />
                </div>
                <input
                    required
                    onChange={onChangeHandler}
                    name="phone"
                    value={formData.phone}
                    className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                    type="number"
                    placeholder="Phone"
                />
            </div>

            {/* ------------- Right Side ------------------ */}
            <div className="mt-8">
                <div className="mt-8 min-w-80">
                    <CartTotal />
                </div>

                <div className="mt-12">
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    {/* --------------- Payment Method Selection ------------- */}
                    <div className="flex gap-3 flex-col lg:flex-row">
                        <div onClick={() => setMethod('cod')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className="text-gray-500 text-sm font-medium mx-4">CASH ON DELIVERY</p>
                        </div>
                        {/* Credit Card Option */}
                        <div onClick={() => setMethod('card')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'card' ? 'bg-green-400' : ''}`}></p>
                            <p className="text-gray-500 text-sm font-medium mx-4">CREDIT CARD</p>
                        </div>
                    </div>
                    {/* Credit Card Form */}
                    {method === 'card' && (
                        <div className="mt-8">
                            <input
                                required
                                className="border border-gray-300 rounded py-1.5 px-3.5 w-full mb-4"
                                type="text"
                                placeholder="Card Number"
                            />
                            <input
                                required
                                className="border border-gray-300 rounded py-1.5 px-3.5 w-full mb-4"
                                type="text"
                                placeholder="Name on Card"
                            />
                            <div className="flex gap-3">
                                <input
                                    required
                                    className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                                    type="text"
                                    placeholder="Expiry Date (MM/YY)"
                                />
                                <input
                                    required
                                    className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                                    type="text"
                                    placeholder="CVV"
                                />
                            </div>
                        </div>
                    )}


                    <div className="w-full text-end mt-8">
                        <button type="submit" className="bg-black text-white px-16 py-3 text-sm">
                            PLACE ORDER
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;