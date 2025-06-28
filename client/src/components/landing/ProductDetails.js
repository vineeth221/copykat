import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { addToCart } from '../../redux/CartSlice';
import { fetchProducts } from '../../redux/productSlice';
import Navbar from '../navbar/Navbar';

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const [selectedImage, setSelectedImage] = useState('');
  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  const product = products.find((p) => p._id === id);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.imageUrl); // Set the main image initially
    }
  }, [product]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!product) {
    return <p>Product not found!</p>;
  }

  const handleAddToCart = () => {
    dispatch(addToCart(product));
  };

  return (
    <div>
      <Navbar />
      <div className="flex justify-center items-start py-12">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 sm:px-8 lg:px-10">
          {/* Product Image */}
          <div className="p-6 rounded-lg">
            <img
              src={selectedImage || product.imageUrl}
              alt={product.name}
              className="w-full h-[500px] object-cover rounded-lg"
            />
            {/* Thumbnail Images */}
            <div className="flex gap-2 mt-4">
              {product.thumbnails && product.thumbnails.map((thumbnail, index) => (
                <img
                  key={index}
                  src={thumbnail}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-[#ff6b00]"
                  onClick={() => setSelectedImage(thumbnail)}
                />
              ))}
            </div>
          </div>

          {/* Product Details and Add to Cart */}
          <div className="p-6 rounded-lg flex flex-col gap-6 scrollable-section">
            <h1 className="text-3xl font-semibold">{product.name}</h1>
            <p className="text-lg text-gray-700">{product.description}</p>
            <p className="text-2xl font-bold text-gray-800">₹{product.price}</p>
            <Link
              to="/cart"
              onClick={handleAddToCart}
              className="mt-4 py-3 px-8 bg-[#ff6b00] text-white font-semibold rounded-lg hover:bg-[#ff6b00] transition-all duration-300"
            >
              Add to Cart
            </Link>
            <div className="mt-6 text-gray-700 text-sm">
              <h3 className="text-lg font-semibold">Product Details</h3>
              <p>Noise Twist Go Bluetooth Calling Smart Watch for Women with Sleek Metal Dial, Glossy Finish, 1.39" Display, 100+ Watch Faces, IP68, Sleep Tracking, Voice Assistance, Upto 7 Days Battery (Gold Link)</p>
              <ul className="list-disc list-inside mt-2">
                <li>Visit the Noise Store</li>
                <li>4.0 out of 5 stars | 15,304 ratings</li>
                <li>Amazon's Choice</li>
                <li>₹1,599.00 with 68% savings (M.R.P.: ₹4,999.00)</li>
                <li>Inclusive of all taxes</li>
              </ul>
            </div>
          </div>

          {/* Product Summary and Buy Now */}
          <div className="p-6 rounded-lg scrollable-section">
            <h3 className="text-xl font-semibold mb-4">Product Summary</h3>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <p className="text-lg">{product.name}</p>
                <p className="text-sm text-gray-600">₹{product.price}</p>
              </div>
            </div>
            <div className="border-t pt-4 text-sm">
              <p className="text-lg font-semibold">Buy Now</p>
              <ul className="list-none mt-2">
                <li><strong>Price:</strong> ₹1,599.00</li>
                <li><strong>Delivery:</strong> FREE delivery Sunday, 19 January</li>
                <li><strong>EMI:</strong> Starts at ₹78.00</li>
                <li><strong>Warranty:</strong> 1 Year Warranty</li>
                <li><strong>Payment:</strong> Secure Transaction</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;