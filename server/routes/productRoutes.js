// /server/routes/productRoutes.js
import express from 'express';
import { getAllProducts, createProduct } from '../controllers/productController.js';

const router = express.Router();

// Route to fetch all products
router.get('/products', getAllProducts);

// Route to create a new product (if needed for testing or adding products via API)
router.post('/products', createProduct);

export default router;
