import Products from "../models/productModel.js";
import {uploadImage, uploadMultipleImages} from "../utils/imageUploadUtil.js";

const createProduct = async (req, res) => {
  try {
    const {
      thumbnail,
      galleryImages,
      productName,
      description,
      category,
      brand,
      gender,
      stock,
      regularPrice,
      salePrice,
      sizes,
      status
    } = req.body;
    // console.log("checking galleryImages in productcontroller", req.body)

    if (
      !productName ||
      !description ||
      !category ||
      !brand ||
      !gender ||
      !stock ||
      !regularPrice ||
      !salePrice ||
      !sizes
    ) {
      return res.status(400).json({message: "All fields are required"});
    }

    const thumbnailUrl = await uploadImage(
      thumbnail,
      "myProducts/thumbnail",
      600,
      600
    );
    const galleryImageUrls = await uploadMultipleImages(
      galleryImages,
      "myProducts/thumbnail",
      600,
      600
    );
    console.log("this is galleryImagesUrls", galleryImageUrls);
    console.log("this is thumbnailUrl", thumbnailUrl);

    const newProduct = new Products({
        productName,
        description,
        category,
        brand,
        gender,
        stock,
        regularPrice,
        salePrice,
        sizes,
        thumbnail: thumbnailUrl,
        gallery: galleryImageUrls,
        status

    })
    const products = await newProduct.save()
    return res.status(200).json({message: "Product added Successfully"});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Failed to add product"});
  }
};

const getProducts = async (req, res) =>{
    try{
        // const products = await Products.find({})
        const products = await Products.find({}).populate('category').populate('brand');
        console.log("form the getProducts", products)
        return res.status(200).json({message: "Success", products: products})
    }catch(error){
        return res.status(500).json({message: "Failed to fetch product detials"})
    }
}


export {createProduct, getProducts};
