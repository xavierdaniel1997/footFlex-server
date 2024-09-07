import Products from "../models/productModel.js";
import {calculateOfferPrice} from "../utils/calculateOfferPrice.js";
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
      status,
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
      status,
    });
    const products = await newProduct.save();
    return res.status(200).json({message: "Product added Successfully"});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Failed to add product"});
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Products.find({})
      .populate("category")
      .populate("brand")
      .populate("offer")
      .populate({
        path: "category",
        populate: {path: "offer"},
      })
      .sort({
        createdAt: -1,
      })
      .limit(12);

    const results = products.map((product) => {
      const productOffer = product.offer?.discountPercentage || 0;
      const categoryOffer = product.category?.offer?.discountPercentage || 0;
      const offerExpirationDate =
        product.offer?.endDate || product.category?.offer?.endDate;
      const priceDetails = calculateOfferPrice(
        product.salePrice,
        productOffer,
        categoryOffer,
        offerExpirationDate
      );
      return {
        ...product.toObject(),
        ...priceDetails,
        offerValid: priceDetails.offerPercentage > 0,
      };
    });

    return res.status(200).json({message: "Success", products: results});
  } catch (error) {
    return res.status(500).json({message: "Failed to fetch product detials"});
  }
};

const getProductsToAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Products.countDocuments({});
    const products = await Products.find({})
      .populate("category")
      .populate("brand")
      .populate({
        path: "category",
        populate: {path: "offer"},
      })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);
    return res.status(200).json({
      message: "Success",
      products: products,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount: totalCount,
    });
  } catch (error) {
    return res.status(500).json({message: "Failed to fetch product detials"});
  }
};

const getProductByGender = async (req, res) => {
  try {
    const {gender} = req.query;
    const query = gender ? {gender} : {};
    const products = await Products.find(query)
      .populate("category")
      .populate("brand")
      .populate("offer")
      .populate({
        path: "category",
        populate: {path: "offer"},
      })
      .sort({createdAt: -1});
    if (!products) {
      return res.status(400).json({message: "No item founded"});
    }

    const results = products.map((product) => {
      const productOffer = product.offer?.discountPercentage || 0;
      const categoryOffer = product.category?.offer?.discountPercentage || 0;
      const offerExpirationDate =
        product.offer?.endDate || product.category?.offer?.endDate;
      const priceDetails = calculateOfferPrice(
        product.salePrice,
        productOffer,
        categoryOffer,
        offerExpirationDate
      );
      return {
        ...product.toObject(),
        ...priceDetails,
        offerValid: priceDetails.offerPercentage > 0,
      };
    });

    return res
      .status(200)
      .json({message: "Product fetch successfully", products: results});
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({message: "Something went wrong while fetching data"});
  }
};

const getProductById = async (req, res) => {
  try {
    const {id} = req.params;
    const productDetial = await Products.findById(id)
      .populate("category")
      .populate("brand")
      .populate("offer")
      .populate({
        path: "category",
        populate: {path: "offer"},
      });
    if (!productDetial) {
      return res.status(400).json({message: "Product not found"});
    }

    // console.log("this is from the product get by id", productDetial)

    const productOffer = productDetial.offer?.discountPercentage || 0;
    const categoryOffer =
      productDetial.category?.offer?.discountPercentage || 0;
    const offerExpirationDate =
      productDetial.offer?.endDate || productDetial.category?.offer?.endDate;
    const priceDetails = calculateOfferPrice(
      productDetial.salePrice,
      productOffer,
      categoryOffer,
      offerExpirationDate
    );

    // console.log("this is from the product get by id", priceDetails); 
    return res
      .status(200)
      .json({
        message: "Product fetch successfully",
        productDetial,
        ...priceDetails,
        offerValid: priceDetails.offerPercentage > 0,
      });
  } catch (error) {
    return res.status(500).json({message: "Failed to get the product"});
  }
};

const updateProduct = async (req, res) => {
  try {
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
      status,
    } = req.body;

    console.log(
      "this is from the product controller checking the galleryImages",
      galleryImages
    );
    const product = await Products.findById(id);
    if (!product) {
      return res.status(400).json({message: "Product not found"});
    }
    (product.productName = productName || product.productName),
      (product.description = description || product.description),
      (product.category = category || product.category),
      (product.brand = brand || product.brand),
      (product.gender = gender || product.gender);
    (product.stock = stock !== undefined ? stock : product.stock),
      (product.regularPrice =
        regularPrice !== undefined ? regularPrice : product.regularPrice),
      (product.salePrice =
        salePrice !== undefined ? salePrice : product.salePrice),
      (product.sizes = sizes || product.sizes),
      (product.status = status !== undefined ? status : product.status);

    if (thumbnail) {
      product.thumbnail = await uploadImage(
        thumbnail,
        "myProducts/thumbnail",
        600,
        600
      );
    }

    if (galleryImages) {
      try {
        const uploadedImages = await uploadMultipleImages(
          galleryImages,
          "myProducts/thumbnail",
          600,
          600
        );
        // console.log("Uploaded images:", uploadedImages);
        product.gallery = uploadedImages;
      } catch (error) {
        console.error("Error uploading gallery images:", error);
        return res
          .status(500)
          .json({message: "Error uploading gallery images"});
      }
    }

    const updatedProduct = await product.save();
    return res
      .status(200)
      .json({message: "Updated Successfully", product: updatedProduct});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Something went wrong"});
  }
};

const blockProduct = async (req, res) => {
  try {
    const {status} = req.body;
    const {id} = req.params;
    const product = await Products.findById(id);
    if (!product) {
      return res.status(400).json({message: "Product not found"});
    }
    product.status = !product.status;
    await product.save();
    const productStatusMessage = product.status ? "Active" : "Blocked";
    return res
      .status(200)
      .json({message: `Product is ${productStatusMessage}`, product});
  } catch (error) {
    console.log(error);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const {id} = req.params;
    await Products.findByIdAndDelete(id);
    return res.status(200).json({message: "Product deleted successfully"});
  } catch (error) {
    return res.status(500).json({message: "Failed to delete"});
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Products.find({})
      .populate("category")
      .populate("brand")
      .populate({
        path: "category",
        populate: {path: "offer"},
      })
      .sort({
        createdAt: -1,
      });
    return res.status(200).json({message: "Success", products: products});
  } catch (error) {
    return res.status(500).json({message: "Failed to fetch product detials"});
  }
};

export {
  createProduct,
  getProducts,
  getProductsToAdmin,
  updateProduct,
  deleteProduct,
  getProductById,
  blockProduct,
  getProductByGender,
  getAllProducts,
};
