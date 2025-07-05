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

      <div className="flex space-x-4 overflow-x-auto scrollbar-hide p-2">
        {loading ? (
          Array(6)
            .fill()
            .map((_, index) => (
              <div key={index} className="min-w-[150px]">
                <Skeleton height={200} width={150} />
              </div>
            ))
        ) : Array.isArray(recentViews) && recentViews.length > 0 ? (
          recentViews.map((product) => (
            <div key={product._id || product.id} className="min-w-[150px] p-2">
              <img
                src={product.imageUrl || product.image || '/placeholder.png'}
                alt={product.name || 'Product'}
                className="w-full h-[200px] object-cover rounded"
              />
              <p className="text-sm mt-2 text-center font-medium">{product.name}</p>
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
