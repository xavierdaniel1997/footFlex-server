
import Products from '../models/productModel.js'; 
import mongoose from 'mongoose';
import { calculateOfferPrice } from '../utils/calculateOfferPrice.js';

const getFilteredProducts = async (req, res) => {
  // console.log("this is frm the getFilteredProducts", req.query)  
  try {
    const { gender, brands, categories, prices, sort } = req.query;

    let query = {};

    if (gender) {
      query.gender = gender;
    }

    if (brands) {
      const brandList = brands.split(',').map(brand => brand.trim());
      const brandIds = await mongoose.model('Brands').find({ brandName: { $in: brandList } }).select('_id');
      query.brand = { $in: brandIds };
    }
              
    if (categories) {
      const categoryList = categories.split(',').map(category => category.trim());
      const categoryIds = await mongoose.model('Category').find({ categoryName: { $in: categoryList } }).select('_id');
      query.category = { $in: categoryIds };
    }



    let sortOption = {};
    if (sort === 'High to Low') {
      sortOption = { salePrice: -1 };
    } else if (sort === 'Low to High') {
      sortOption = { salePrice: 1 };
    }else if(sort === "aA - zZ"){
      sortOption = {productName: 1}
    }else if(sort === "zZ - aA"){
      sortOption = {productName : -1}
    }
     else {
      sortOption = {createdAt: -1}; 
    }


    console.log("query", query)
    const filteredProducts = await Products.find(query)
      .populate('category brand')
      .populate("offer")
      .populate({
        path: "category", 
        populate: { path: "offer" }
      })
      .sort(sortOption)
      .exec();
    

      const results = filteredProducts.map(product => {
        const productOffer = product.offer?.discountPercentage || 0;
        const categoryOffer = product.category?.offer?.discountPercentage || 0;
        const offerExpirationDate = product.offer?.endDate || product.category?.offer?.endDate;
        const priceDetails = calculateOfferPrice(product.salePrice, productOffer, categoryOffer, offerExpirationDate);  
        return {
          ...product.toObject(),
          ...priceDetails,
          offerValid: priceDetails.offerPercentage > 0
        };
      });

      
    return res.status(200).json({
      message: "Products fetched successfully", 
      products: results,                        
    });   
  } catch (error) {
    console.error(error);      
    return res.status(500).json({ message: "Something went wrong" });
  }
};




export {getFilteredProducts};




