import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch wishlist items when the component loads
  useEffect(() => {
    fetchWishlistItems();
  }, []);

  // Fetch items in the wishlist
  const fetchWishlistItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('You must be logged in to view your wishlist.');
        return;
      }

      const response = await fetch('http://localhost:4000/api/wishlist', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to fetch wishlist.');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setWishlistItems(data.products || []);
        setErrorMessage('');
      } else {
        setErrorMessage(data.message || 'Failed to fetch wishlist.');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setErrorMessage('An error occurred while fetching the wishlist.');
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('You must be logged in to remove items from the wishlist.');
        return;
      }

      const response = await fetch(`http://localhost:4000/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to remove product.');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setWishlistItems((prevItems) => prevItems.filter((item) => item._id !== productId));
        setErrorMessage('');
      } else {
        setErrorMessage(data.message || 'Failed to remove product.');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setErrorMessage('An error occurred while removing the product.');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Your Wishlist</h1>

      {/* Display error messages */}
      {errorMessage && <div style={{ color: 'red', marginBottom: '1rem' }}>{errorMessage}</div>}

      {/* Display wishlist items */}
      {wishlistItems.length === 0 ? (
        <p>No items in your wishlist. <Link to="/collection">Browse products</Link> to add some!</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1rem',
          }}
        >
          {wishlistItems.map((product) => (
            <div
              key={product._id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '5px',
                padding: '1rem',
                textAlign: 'center',
              }}
            >
              <img
                src={product.image?.[0]}
                alt={product.name}
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
              />
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              <button
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                }}
                onClick={() => removeFromWishlist(product._id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
