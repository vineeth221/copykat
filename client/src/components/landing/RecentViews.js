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
    if (products.length > 0) {
      setRecentViews(products.slice(0, 9)); // Show only the first 6 recent views
    }
  }, [products]);

  return (
    <div className="bg-white p-6 mt-4">
      <h2 className="text-2xl font-semibold mb-4">Related to items you've viewed</h2>
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide p-2">
        {loading
          ? Array(6)
              .fill()
              .map((_, index) => (
                <div key={index} className="min-w-[150px]">
                  <Skeleton height={200} width={150} />
                </div>
              ))
          : recentViews.map((product) => (
              <div key={product._id} className="min-w-[150px] p-2">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-[200px] object-cover rounded"
                />
                <p className="text-sm mt-2 text-center font-medium">{product.name}</p>
              </div>
            ))}
      </div>
    </div>
  );
};

export default RecentViews;
