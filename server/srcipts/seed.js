import mongoose from 'mongoose';
import Product from '../models/Product.js';
import cloudinary from 'cloudinary';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Seed products
const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const products = [
      {
        name: 'Rolex Watch',
        price: 1200,
        description: 'A luxury watch.',
        image: 'path_to_local_image_or_base64_encoded_image_data',  // Use a valid image URL or base64 string
      },
      {
        name: 'Casio Watch',
        price: 50,
        description: 'An affordable watch.',
        image: 'path_to_local_image_or_base64_encoded_image_data',  // Use a valid image URL or base64 string
      },
    ];

    // Upload image to Cloudinary and add product to the database
    for (let product of products) {
      const uploadResponse = await cloudinary.v2.uploader.upload(product.image);
      const newProduct = new Product({
        name: product.name,
        price: product.price,
        description: product.description,
        image: uploadResponse.secure_url, // Cloudinary image URL
      });
      await newProduct.save();
    }

    console.log('Products seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding products:', error);
    mongoose.connection.close();
  }
};

seedProducts();
