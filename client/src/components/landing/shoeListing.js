import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../navbar/Navbar';
import Footer from '../landing/footer';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { addToCart, incrementQuantity, decrementQuantity } from '../../redux/CartSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const ShoeListing = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [shoes, setShoes] = useState([]);
  const [filteredShoes, setFilteredShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 50000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [addingToCart, setAddingToCart] = useState({});
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const fetchShoes = async () => {
      try {
        const response = await axios.get('http://localhost:8005/shoes');
        setShoes(response.data);
        setFilteredShoes(response.data);
        const uniqueBrands = [...new Set(response.data.map((item) => item.brand))];
        setBrands(uniqueBrands);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchShoes();
  }, []);

  useEffect(() => {
    let filtered = [...shoes];

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((shoe) => selectedBrands.includes(shoe.brand));
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((shoe) => selectedCategories.includes(shoe.category));
    }
    filtered = filtered.filter(
      (shoe) => shoe.price >= selectedPriceRange[0] && shoe.price <= selectedPriceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case 'priceLowToHigh':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceHighToLow':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredShoes(filtered);
  }, [selectedBrands, selectedPriceRange, selectedCategories, sortBy, shoes]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (i - rating < 1) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-400" />);
      }
    }
    return stars;
  };

  const handleAddToCart = async (shoe) => {
    setAddingToCart((prev) => ({ ...prev, [shoe._id]: true }));
    try {
      window.location.reload();
      await dispatch(addToCart(shoe)).unwrap();
    } catch (error) {
    } finally {
      setAddingToCart((prev) => ({ ...prev, [shoe._id]: false }));
    }
  };

  const handleIncrementQuantity = (productId) => {
    dispatch(incrementQuantity(productId));
  };

  const handleDecrementQuantity = (productId) => {
    dispatch(decrementQuantity(productId));
  };

  const getQuantity = (productId) => {
    const item = cartItems.find((item) => item.productId === productId);
    return item ? item.quantity : 0;
  };

  return (
    <>
      <Navbar />
      <div className="flex p-6">
        {/* Left Section - Filters */}
        <div className="w-1/5 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">Filters</h4>

          {/* Brand Filter */}
          <div className="mb-6">
            <h5 className="text-md font-medium mb-2 text-gray-700">Brand</h5>
            {brands.map((brand, index) => (
              <label key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  value={brand}
                  checked={selectedBrands.includes(brand)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedBrands([...selectedBrands, brand]);
                    } else {
                      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
                    }
                  }}
                  className="form-checkbox h-4 w-4 text-orange-500 rounded focus:ring-orange-400"
                />
                <span className="text-sm text-gray-600">{brand}</span>
              </label>
            ))}
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <h5 className="text-md font-medium mb-2 text-gray-700">Category</h5>
            {['Men', 'Women', 'Kids'].map((category, index) => (
              <label key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  value={category}
                  checked={selectedCategories.includes(category)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([...selectedCategories, category]);
                    } else {
                      setSelectedCategories(selectedCategories.filter((c) => c !== category));
                    }
                  }}
                  className="form-checkbox h-4 w-4 text-orange-500 rounded focus:ring-orange-400"
                />
                <span className="text-sm text-gray-600">{category}</span>
              </label>
            ))}
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h5 className="text-md font-medium mb-2 text-gray-700">Price Range</h5>
            <input
              type="range"
              min="0"
              max="50000"
              value={selectedPriceRange[0]}
              onChange={(e) => setSelectedPriceRange([Number(e.target.value), selectedPriceRange[1]])}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="50000"
              value={selectedPriceRange[1]}
              onChange={(e) => setSelectedPriceRange([selectedPriceRange[0], Number(e.target.value)])}
              className="w-full"
            />
            <p className="text-sm text-gray-600 mt-2">
              ₹{selectedPriceRange[0]} - ₹{selectedPriceRange[1]}
            </p>
          </div>

          {/* Sort By */}
          <div className="mb-6">
            <h5 className="text-md font-medium mb-2 text-gray-700">Sort By</h5>
            <select
              onChange={(e) => setSortBy(e.target.value)}
              value={sortBy}
              className="w-full p-2 border border-gray-300 rounded focus:ring-orange-400 focus:border-orange-400"
            >
              <option value="default">Default</option>
              <option value="priceLowToHigh">Price: Low to High</option>
              <option value="priceHighToLow">Price: High to Low</option>
              <option value="popularity">Popularity</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Right Section - Product Listing */}
        <div className="w-4/5 pl-6">
          {loading ? (
            <div className="grid grid-cols-4 gap-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="border rounded-lg shadow-md">
                  <Skeleton height={250} />
                  <div className="p-4">
                    <Skeleton height={20} width={120} className="mt-2" />
                    <Skeleton height={20} width={160} />
                    <Skeleton height={20} width={100} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredShoes.map((shoe) => {
                const quantity = getQuantity(shoe._id);
                return (
                  <div key={shoe._id} className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
                    <Link to={`/shoes/${shoe._id}`}>
                      <img
                        src={shoe.imageUrl}
                        alt={shoe.name}
                        className="w-full h-80 object-contain rounded-t"
                      />
                      <div className="p-4">
                        <h5 className="mt-2 text-lg font-semibold">{shoe.name}</h5>
                        <div className="flex items-center text-sm mt-1">
                          {renderStars(shoe.rating)}
                          <span className="ml-2 text-gray-600">({Math.floor(Math.random() * 1000)} reviews)</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{shoe.description}</p>
                        <div className="mt-2">
                          {shoe.originalPrice && (
                            <span className="text-gray-500 line-through">
                              ₹{shoe.originalPrice} {shoe.discount ? `(${shoe.discount}% off)` : ''}
                            </span>
                          )}
                          <p className="text-black text-lg font-bold mt-1">₹{shoe.price}</p>
                          {shoe.discount > 0 && (
                            <p className="text-green-600 text-sm mt-1">{shoe.discount}% off on this product!</p>
                          )}
                        </div>
                      </div>
                    </Link>
                    {quantity > 0 ? (
                      <div className="flex space-x-2 p-2">
                        <button
                          className="w-8 h-8 bg-[#ff6b00] text-white rounded-full flex items-center justify-center hover:bg-[#ff6b00] transition-colors duration-300"
                          onClick={() => handleDecrementQuantity(shoe._id)}
                        >
                          -
                        </button>
                        <span className="text-lg font-semibold">{quantity}</span>
                        <button
                          className="w-8 h-8 bg-[#ff6b00] text-white rounded-full flex items-center justify-center hover:bg-[#ff6b00] transition-colors duration-300"
                          onClick={() => handleIncrementQuantity(shoe._id)}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        className="ml-4 mb-2 px-3 py-1 bg-[#ff6b00] text-white text-sm rounded hover:bg-[#ff6b00] transition-colors duration-300 font-semibold"
                        onClick={() => handleAddToCart(shoe)}
                        disabled={addingToCart[shoe._id]}
                      >
                        {addingToCart[shoe._id] ? (
                          <ClipLoader size={15} color="#ffffff" />
                        ) : (
                          'Add to Cart'
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ShoeListing;