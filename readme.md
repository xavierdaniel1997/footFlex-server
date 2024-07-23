Step -3

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  gender: { type: String, enum: ['Men', 'Women', 'Unisex'], required: true },
  stock: { type: Number, default: 0, min: 0 },
  sizes: [{ 
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 }
  }],
  colors: [{ type: String }],
  images: [{ type: String }],
  regularPrice: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);




step -4 

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, required: true }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Pending', 'Paid', 'Shipped', 'Delivered'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);


step -5










import { v2 as cloudinary } from 'cloudinary';

 cloudinary.config({  
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;


****************************************************************


const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  gender: { type: String, required: true },
  sku: { type: String, required: true },
  regularPrice: { type: Number, required: true },
  salePrice: { type: Number },
  sizes: [{ 
    size: String, 
    stock: Number 
  }],
  thumbnail: { type: String, required: true },
  galleryImages: [{ type: String }],
});

module.exports = mongoose.model('Product', productSchema);