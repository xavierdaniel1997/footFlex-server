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
        const products = await Products.find({}).populate('category').populate('brand').sort({
          createdAt: -1}).limit(12);
        console.log("form the getProducts", products)
        return res.status(200).json({message: "Success", products: products})
    }catch(error){
        return res.status(500).json({message: "Failed to fetch product detials"})
    }
}

const getProductByGender = async (req, res) => {
  try{
    const {gender } = req.query;
    const query = gender ? {gender} : {}
    const products = await Products.find(query).populate('category').populate('brand').sort({createdAt: -1});
    if(!products){
      return res.status(400).json({message: "No item founded"})
    }
    return res.status(200).json({message: "Product fetch successfully", products: products})

  }catch(error){
    console.log(error)
    return res.status(500).json({message: "Something went wrong while fetching data"})
  }
}

const getProductById = async (req, res) => {
  try{
    const {id} = req.params;
    const productDetial = await Products.findById(id).populate('category').populate('brand');
    if(!productDetial){
      return res.status(400).json({message: "Product not found"})
    }
    return res.status(200).json({message: "Product fetch successfully" , productDetial})
  }catch(error){
    return res.status(500).json({message: "Failed to get the product"})
  }
}


const updateProduct = async (req, res) => {
  try{
    const {id} = req.params;
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
    const product = await Products.findById(id)
    if(!product){
      return res.status(400).json({message: "Product not found"})
    }
    product.productName = productName|| product.productName, 
    product.description = description|| product.description,
    product.category = category || product.category,
    product.brand = brand || product.brand,
    product.gender = gender || product.gender
    product.stock = stock !== undefined ? stock : product.stock,
    product.regularPrice = regularPrice !== undefined ? regularPrice : product.regularPrice,
    product.salePrice = salePrice !== undefined ? salePrice : product.salePrice,
    product.sizes = sizes|| product.sizes,
    product.status = status !== undefined ? status : product.status

    if(thumbnail){
      product.thumbnail = await uploadImage(
        thumbnail,
        "myProducts/thumbnail",
        600,
        600
      );
    }

    if(galleryImages){
      product.galleryImages = await uploadMultipleImages(
        galleryImages,
        "myProducts/thumbnail",
        600,
        600
      );
    }
    const updatedProduct = await product.save()
    return res.status(200).json({message: "Updated Successfully", product: updatedProduct})
  }catch(error){
    return res.status(500).json({message: "Something went wrong"})
  }
}

const blockProduct = async (req, res) => {
  try{
    const {status} = req.body;
    const {id} = req.params;
    const product = await Products.findById(id)
    if(!product){
      return res.status(400).json({message: "Product not found"})
    }
    product.status = !product.status;
    await product.save();
    const productStatusMessage = product.status ? "Active" : "Blocked"
    return res.status(200).json({message: `Product is ${productStatusMessage}`, product})
  }catch(error){
    console.log(error)
  }
}


const deleteProduct = async (req, res) => {
  try{
    const {id} = req.params;
    await Products.findByIdAndDelete(id)
    return res.status(200).json({message: "Product deleted successfully"})
  }catch(error){
    return res.status(500).json({message: "Failed to delete"})
  }
}


export {createProduct, getProducts, updateProduct, deleteProduct, getProductById, blockProduct, getProductByGender};
