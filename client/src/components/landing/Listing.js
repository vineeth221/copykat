import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../redux/productSlice';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import Navbar from '../navbar/Navbar';
import Footer from '../landing/footer';
import 'react-loading-skeleton/dist/skeleton.css';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { addToCart, incrementQuantity, decrementQuantity } from '../../redux/CartSlice';
import { ClipLoader } from 'react-spinners';

const Listing = () => {
  const dispatch = useDispatch();
  const { products, loading: productsLoading, error } = useSelector((state) => state.products || {});
  const cartItems = useSelector((state) => state.cart.items);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      const uniqueBrands = [...new Set(products.map((product) => product.name))];
      setBrands(uniqueBrands);
      setFilteredProducts(products);
    }
  }, [products]);
  

  useEffect(() => {
    let filtered = products;

    // Apply filters
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) => selectedBrands.includes(product.name));
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => selectedCategories.includes(product.category));
    }
    if (selectedColors.length > 0) {
      filtered = filtered.filter((product) =>
        product.colors.some((color) => selectedColors.includes(color))
      );
    }
    if (selectedRatings.length > 0) {
      filtered = filtered.filter((product) =>
        selectedRatings.some((rating) => product.rating >= rating)
      );
    }
    if (selectedDiscounts.length > 0) {
      filtered = filtered.filter((product) =>
        selectedDiscounts.some((discount) => product.discount >= discount)
      );
    }
    if (selectedAvailability === 'inStock') {
      filtered = filtered.filter((product) => product.stock > 0);
    } else if (selectedAvailability === 'outOfStock') {
      filtered = filtered.filter((product) => product.stock === 0);
    }
    filtered = filtered.filter(
      (product) => product.price >= selectedPriceRange[0] && product.price <= selectedPriceRange[1]
    );

    // Apply sorting
    if (sortBy === 'priceLowToHigh') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHighToLow') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popularity') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(filtered);
  }, [
    selectedBrands,
    selectedPriceRange,
    selectedCategories,
    selectedColors,
    selectedRatings,
    selectedDiscounts,
    selectedAvailability,
    sortBy,
    products,
  ]);

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

  const handleAddToCart = async (product) => {
    setAddingToCart((prev) => ({ ...prev, [product._id]: true }));
    try {
      const result = await dispatch(addToCart(product)).unwrap();
      window.location.reload();
    } catch (error) {
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product._id]: false }));
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
            {Array.isArray(brands) && brands.map((brand, index) => (
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

          {/* Color Filter */}
          <div className="mb-6">
            <h5 className="text-md font-medium mb-2 text-gray-700">Color</h5>
            {['Red', 'Blue', 'Green', 'Black', 'White'].map((color, index) => (
              <label key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  value={color}
                  checked={selectedColors.includes(color)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedColors([...selectedColors, color]);
                    } else {
                      setSelectedColors(selectedColors.filter((c) => c !== color));
                    }
                  }}
                  className="form-checkbox h-4 w-4 text-orange-500 rounded focus:ring-orange-400"
                />
                <span className="text-sm text-gray-600">{color}</span>
              </label>
            ))}
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h5 className="text-md font-medium mb-2 text-gray-700">Price Range</h5>
            <input
              type="range"
              min="0"
              max="100000"
              value={selectedPriceRange[0]}
              onChange={(e) => setSelectedPriceRange([Number(e.target.value), selectedPriceRange[1]])}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="10000"
              value={selectedPriceRange[1]}
              onChange={(e) => setSelectedPriceRange
                ([selectedPriceRange[0], Number(e.target.value)])}
              className="w-full"
            />
            <p className="text-sm text-gray-600 mt-2">
              ₹{selectedPriceRange[0]} - ₹{selectedPriceRange[1]}
            </p>
          </div>

          {/* Rating Filter */}
          <div className="mb-6">
            <h5 className="text-md font-medium mb-2 text-gray-700">Customer Rating</h5>
            {[4, 3, 2, 1].map((rating, index) => (
              <label key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  value={rating}
                  checked={selectedRatings.includes(rating)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRatings([...selectedRatings, rating]);
                    } else {
                      setSelectedRatings(selectedRatings.filter((r) => r !== rating));
                    }
                  }}
                  className="form-checkbox h-4 w-4 text-orange-500 rounded focus:ring-orange-400"
                />
                <span className="text-sm text-gray-600">{rating} Stars & Above</span>
              </label>
            ))}
          </div>

          {/* Discount Filter */}
          <div className="mb-6">
            <h5 className="text-md font-medium mb-2 text-gray-700">Discount</h5>
            {[10, 20, 30, 40].map((discount, index) => (
              <label key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  value={discount}
                  checked={selectedDiscounts.includes(discount)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDiscounts([...selectedDiscounts, discount]);
                    } else {
                      setSelectedDiscounts(selectedDiscounts.filter((d) => d !== discount));
                    }
                  }}
                  className="form-checkbox h-4 w-4 text-orange-500 rounded focus:ring-orange-400"
                />
                <span className="text-sm text-gray-600">{discount}% Off or More</span>
              </label>
            ))}
          </div>

          {/* Availability Filter */}
          <div className="mb-6">
            <h5 className="text-md font-medium mb-2 text-gray-700">Availability</h5>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                value="all"
                checked={selectedAvailability === 'all'}
                onChange={() => setSelectedAvailability('all')}
                className="form-radio h-4 w-4 text-orange-500 focus:ring-orange-400"
              />
              <span className="text-sm text-gray-600">All</span>
            </label>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                value="inStock"
                checked={selectedAvailability === 'inStock'}
                onChange={() => setSelectedAvailability('inStock')}
                className="form-radio h-4 w-4 text-orange-500 focus:ring-orange-400"
              />
              <span className="text-sm text-gray-600">In Stock</span>
            </label>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                value="outOfStock"
                checked={selectedAvailability === 'outOfStock'}
                onChange={() => setSelectedAvailability('outOfStock')}
                className="form-radio h-4 w-4 text-orange-500 focus:ring-orange-400"
              />
              <span className="text-sm text-gray-600">Out of Stock</span>
            </label>
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
          {productsLoading ? (
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
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const quantity = getQuantity(product._id);
                return (
                  <div key={product._id} className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
                    <Link to={`/product/${product._id}`}>
                      <img src={product.imageUrl} alt={product.name} className="w-full h-80 object-contain rounded-t" />
                      <div className="p-4">
                        <h5 className="mt-2 text-lg font-semibold">{product.name}</h5>
                        <div className="flex items-center text-sm mt-1">
                          {renderStars(product.rating)}
                          <span className="ml-2 text-gray-600">({Math.floor(Math.random() * 1000)} reviews)</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                        <div className="mt-2">
                          {product.originalPrice && (
                            <span className="text-gray-500 line-through">
                              ₹{product.originalPrice} {product.discount ? `(${product.discount}% off)` : ''}
                            </span>
                          )}
                          <p className="text-black text-lg font-bold mt-1">₹{product.price}</p>
                          <p className="text-green-600 text-sm mt-1">{product.discount}% off on this product!</p>
                        </div>
                      </div>
                    </Link>
                    {quantity > 0 ? (
                      <div className="flex space-x-2 p-2">
                        <button
                          className="w-8 h-8 bg-[#ff6b00] text-white rounded-full flex items-center justify-center hover:bg-[#ff6b00] transition-colors duration-300"
                          onClick={() => handleDecrementQuantity(product._id)}
                        >
                          -
                        </button>
                        <span className="text-lg font-semibold">{quantity}</span>
                        <button
                          className="w-8 h-8 bg-[#ff6b00] text-white rounded-full flex items-center justify-center hover:bg-[#ff6b00] transition-colors duration-300"
                          onClick={() => handleIncrementQuantity(product._id)}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        className="ml-4 mb-2 px-3 py-1 bg-[#ff6b00] text-white text-sm rounded hover:bg-[#ff6b00] transition-colors duration-300 font-semibold"
                        onClick={() => handleAddToCart(product)}
                        disabled={addingToCart[product._id]}
                      >
                        {addingToCart[product._id] ? (
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

export default Listing;