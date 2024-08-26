
import Products from '../models/productModel.js'; 
import mongoose from 'mongoose';

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


    // if (prices) {
    //   const priceConditions = prices.split(',').map(priceRange => {
    //     const [min, max] = priceRange.replace('Rs. ', '').split(' to ').map(Number);
    //     return { salePrice: { $gte: min, $lte: max } };
    //   });

    //   if (priceConditions.length > 0) {
    //     query.$or = priceConditions;
    //   }
    // }

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
      .sort(sortOption)
      .exec();
    

    return res.status(200).json({
      message: "Products fetched successfully", 
      products: filteredProducts,                        
    });   
  } catch (error) {
    console.error(error);      
    return res.status(500).json({ message: "Something went wrong" });
  }
};




export {getFilteredProducts};




