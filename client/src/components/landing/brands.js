import React from 'react';
import { motion } from 'framer-motion';

const brands = [
  { name: 'Nike', logo: 'https://fabrikbrands.com/wp-content/uploads/Nike-Logo-History-1-1.png' },
  { name: 'Adidas', logo: 'https://thumbs.dreamstime.com/b/web-192037111.jpg' },
  { name: 'Apple', logo: 'https://cdn3.iconfinder.com/data/icons/social-media-logos-glyph/2048/5315_-_Apple-1024.png' },
  { name: 'Reebok', logo: 'https://www.citypng.com/public/uploads/preview/hd-reebok-official-logo-transparent-png-701751694774205etuqviguxp.png' },
  { name: 'Sketchers', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/SKECHERS_logo.png/1200px-SKECHERS_logo.png' },
];

const Brand = () => {
  return (
    <div className="py-12 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-6">Trusted by Leading Brands</h2>
      <p className="text-center text-gray-600 mb-10">We proudly collaborate with world-class brands.</p>
      <div className="flex justify-center gap-8 flex-wrap">
        {brands.map((brand, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.1 }}
            className="cursor-pointer hover:shadow-lg transition"
          >
            <img src={brand.logo} alt={brand.name} className="w-32 h-16 object-contain" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Brand;
