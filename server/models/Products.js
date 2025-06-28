// /server/models/Product.js
import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true }, // Store the image URL
});

const Product = mongoose.model('Product', productSchema);

export default Product;
