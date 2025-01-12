import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { toast } from 'react-toastify';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, backendUrl } = useContext(ShopContext);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setUserInfo(response.data.user);
        } else {
          setError('Failed to fetch user information');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Error fetching profile');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserProfile();
    }
  }, [token, backendUrl]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-2xl text-center mb-8">
        <Title text1={'MY'} text2={'PROFILE'} />
      </div>

      {userInfo && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-gray-600 text-sm">User ID</h3>
              <p className="text-gray-900">{userInfo.id}</p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-gray-600 text-sm">Name</h3>
              <p className="text-gray-900">{userInfo.name}</p>
            </div>
            
            <div className="pb-4">
              <h3 className="text-gray-600 text-sm">Email Address</h3>
              <p className="text-gray-900">{userInfo.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 