import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../redux/productSlice';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const sectionTitles = [
  'Pick up where you left off',
  'Keep shopping for',
  'Continue shopping deals',
  'Get bulk discounts + Top B2B deals!!'
];

const RecentViewsGrid = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products || {});
  const [recentViews, setRecentViews] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      setRecentViews(products.slice(0, 4));
    }
  }, [products]);

  return (
    <div className="p-6">
      <div className="grid grid-cols-4 gap-4">
        {sectionTitles.map((title, sectionIndex) => (
          <div key={sectionIndex} className="border p-4 rounded-lg shadow-md bg-white">
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            <div className="grid grid-cols-2 gap-2">
              {loading
                ? Array(4)
                    .fill()
                    .map((_, index) => <Skeleton key={index} height={100} />)
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
        ))}
      </div>
    </div>
  );
};

export default RecentViewsGrid;
