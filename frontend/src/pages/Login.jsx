import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  // Form fields
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  // Handle form submission
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (currentState === 'Sign Up') {
        // SIGN UP FLOW
        const response = await axios.post(
          `${backendUrl}/api/user/register`,
          { name, email, password }
        );

        if (response.data.success) {
          // Store token in context & localStorage
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);

          // Optionally toast success
          toast.success('Account created successfully!');
        } else {
          toast.error(response.data.message || 'Sign Up failed.');
        }

      } else {
        // LOGIN FLOW
        const response = await axios.post(
          `${backendUrl}/api/user/login`,
          { email, password }
        );

        if (response.data.success) {
          // Store token in context & localStorage
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);

          // Optionally toast success
          toast.success('Login successful!');
        } else {
          toast.error(response.data.message || 'Login failed.');
        }
      }

    } catch (error) {
      console.log(error);
      // The .message might be generic, so use a toast error
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // If we already have a token, redirect to home
  useEffect(() => {
    if (token) {
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {/* If "Sign Up", show name input */}
      {currentState === 'Sign Up' && (
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Name"
          required
        />
      )}

      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        required
      />

      <input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type="password"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Password"
        required
      />

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer">Forgot your password?</p>
        {currentState === 'Login' ? (
          <p onClick={() => setCurrentState('Sign Up')} className="cursor-pointer">
            Create account
          </p>
        ) : (
          <p onClick={() => setCurrentState('Login')} className="cursor-pointer">
            Login Here
          </p>
        )}
      </div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  );
};

export default Login;
