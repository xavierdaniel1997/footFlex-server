import Brands from "../models/brandModel.js";
import {uploadImage} from "../utils/imageUploadUtil.js";

const addBrand = async (req, res) => {
  try {
    const {brandName, brandTitle, logo} = req.body;
    console.log("form the brand conttroller", req.body)
    const logoUrl = await uploadImage(logo, "myBrand", 200, 200);
    console.log("this is form brandcontroll logUrl",logoUrl)
    if (!brandName) {  
      return res.status(400).json({message: "brandName is required"});     
    }  
    const existingBrandName = await Brands.findOne({brandName});
    if (existingBrandName) {
      return res.status(400).json({message: "Existing Brand"});   
    }
    const brand = new Brands({
      brandName,
      brandTitle,
      logo: logoUrl,
    });
    const brandData = await brand.save()
    return res.status(200).json({message: "Brand added successfully"})
  } catch (error) {
    return res.status(500).json({message: "Add brand failed"});
  }
};

const getBrand = async (req, res) => {
    try{
        const brandData = await Brands.find()
        return res.status(200).json({message: "brand data", brandData})
    }catch(error){
        return res.status(500).json({message: "Something went wrong"})
    }
}


export {addBrand, getBrand}