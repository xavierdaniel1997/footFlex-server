import Category from "../models/categoryModel.js";
import Offer from "../models/offerModel.js";
import Products from "../models/productModel.js";

const createOffer = async (req, res) => {
  try {
    console.log(req.body);
    const {
      name,
      offerType,
      discountPercentage,
      startDate,
      endDate,
      description,
      targetOfferId,
    } = req.body;

    const offer = new Offer({
      name,
      offerType,
      discountPercentage,
      startDate,
      endDate,
      description,
      targetOfferId,
    });

    await offer.save();

    if (offerType === "Category") {
      await Category.findByIdAndUpdate(targetOfferId, {offer: offer._id});
    } else if (offerType === "Products") {
      await Products.findByIdAndUpdate(targetOfferId, {offer: offer._id});
    }

    return res.status(201).json({message: "Offer created successfully", offer});
  } catch (error) {
    console.log(error);
    return res.status(400).json({message: "Failed to create the offer"});
  }
};

const getOffers = async (req, res) => {
  try {
    const currentDate = new Date();
    const categoryOffersPromise = Offer.find({
      offerType: "Category",
      // endDate: {$gte: currentDate},
    })
      .populate({
        path: "targetOfferId",
        select: "categoryName description",
        model: "Category",
      })
      .exec();

    const productOffersPromise = Offer.find({
      offerType: "Products",
      // endDate: {$gte: currentDate}, 
    })
      .populate({
        path: "targetOfferId",
        select: "productName description price thumbnail",
        model: "Products",
      })
      .exec();

    const [categoryOffers, productOffers] = await Promise.all([
      categoryOffersPromise,
      productOffersPromise,
    ]);

    res.status(200).json({
      categoryOffers,
      productOffers,
    });
  } catch (error) {
    console.error("Error fetching offers:", error);
    res
      .status(500)
      .json({message: "Error fetching offers", error: error.message});
  }
};

export {createOffer, getOffers};
