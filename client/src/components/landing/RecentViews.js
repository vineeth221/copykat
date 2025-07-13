import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../redux/productSlice';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const RecentViews = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products || {});
  const [recentViews, setRecentViews] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      setRecentViews(products.slice(0, 9)); // Get up to 9 products
    }
  }, [products]);

  return (
    <div className="bg-white p-6 mt-4">
      <h2 className="text-2xl font-semibold mb-4">Related to items you've viewed</h2>

      <div className="flex overflow-x-auto scrollbar-hide space-x-4 p-2">
  {loading ? (
    Array(6)
      .fill()
      .map((_, index) => (
        <div
          key={index}
          className="flex-shrink-0 w-[110px] sm:w-[120px] md:w-[140px] lg:w-[160px]"
        >
          <Skeleton height={140} />
        </div>
      ))
  ) : Array.isArray(recentViews) && recentViews.length > 0 ? (
    recentViews.map((product) => (
      <div
        key={product._id || product.id}
        className="flex-shrink-0 w-[110px] sm:w-[120px] md:w-[140px] lg:w-[160px] p-1"
      >
        <img
          src={product.imageUrl || product.image || '/placeholder.png'}
          alt={product.name || 'Product'}
          className="rounded h-[130px] sm:h-[140px] md:h-[160px] lg:h-[180px] w-full object-cover"
        />
        <p className="text-xs sm:text-sm mt-1 text-center font-medium truncate">
          {product.name}
        </p>
      </div>
    ))
  ) : (
    <p className="text-gray-500 text-sm">No products found.</p>
  )}
</div>

    </div>
  );
};

export default RecentViews;
