// /server/controllers/productController.js
import Product from '../models/Product.js';

// Controller to get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from the database
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }
    res.status(200).json(products); // Send the products as the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// Controller to create a new product
export const createProduct = async (req, res) => {
  const { name, price, image, brand } = req.body;

  if (!name || !price || !image || !brand) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newProduct = new Product({
      name,
      price,
      image,
      brand,
    });

    await newProduct.save(); // Save the new product to the database
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};
