/*

import Cart from "../models/cartModel.js";
import { calculateOfferPrice } from "../utils/calculateOfferPrice.js";
import Coupon from "../models/couponModel.js";

const calculateCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { couponId } = req.body;
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.productId",
      populate: [
        { path: "brand" },
        { path: "offer" },
        {
          path: "category",
          model: "Category",
          populate: {
            path: "offer",
            model: "Offer",
          },
        },
      ],
    });

    if (!cart) {
      return res.status(400).json({ message: "Cart items not found" });
    }

    let originalTotalPrice = 0;
    let totalPriceAfterDiscount = 0;
    let savedTotal = 0;
    let couponDiscount = 0;
    let deliveryCharge = 50;

    cart?.items?.forEach((item) => {
      const product = item.productId;
      const productOffer = product?.offer?.discountPercentage || 0;
      const categoryOffer =
        product?.category?.offer?.discountPercentage || 0;
      const offerExpirationDate =
        product?.offer?.endDate || product?.category?.offer?.endDate;

      const priceDetails = calculateOfferPrice(
        product?.salePrice,
        productOffer,
        categoryOffer,
        offerExpirationDate
      );

      const originalPrice = product.salePrice * item.quantity;
      const discountedPrice = priceDetails.discountedPrice 
        ? priceDetails.discountedPrice * item.quantity 
        : originalPrice;

      originalTotalPrice += originalPrice;
      totalPriceAfterDiscount += discountedPrice;
      savedTotal += originalPrice - discountedPrice;
    });

    let finalPrice = totalPriceAfterDiscount + deliveryCharge;

    if(couponId){ 
      const coupon = await Coupon.findById(couponId);
      console.log("this is from the calculateCheckout", coupon)
      if (!coupon || !coupon.status || new Date() < coupon.startDate || new Date() > coupon.endDate) {
        return res.status(400).json({ message: "Invalid or expired coupon" });    
      }    

      const discountAmount = (finalPrice * coupon.discount) / 100;
      const finalDiscountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      finalPrice -= finalDiscountAmount;
      finalPrice = Math.max(finalPrice, 0);
      couponDiscount = finalDiscountAmount
      cart.couponDiscount = couponDiscount;


    }
    cart.couponDiscount = couponDiscount;
    await cart.save();

                          
    return res.status(200).json({
      originalTotalPrice,
      totalPriceAfterDiscount, 
      savedTotal,
      deliveryCharge,
      couponDiscount: cart.couponDiscount,
      finalPrice
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export { calculateCheckout };
*/


import Cart from "../models/cartModel.js";
import { calculateOfferPrice } from "../utils/calculateOfferPrice.js";
import Coupon from "../models/couponModel.js";

export const calculateCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId }).populate({     
      path: "items.productId",
      populate: [
        { path: "brand" },
        { path: "offer" },
        {
          path: "category",
          model: "Category",
          populate: {
            path: "offer",
            model: "Offer",
          },
        },
      ],
    }).populate('appliedCoupon.couponId');

    if (!cart) {
      return res.status(400).json({ message: "Cart items not found" });
    }

    let originalTotalPrice = 0;
    let totalPriceAfterDiscount = 0;
    let savedTotal = 0;
    let deliveryCharge = 50;

    const results = cart.items.map((item) => {
      const product = item.productId;
      const productOffer = product?.offer?.discountPercentage || 0;
      const categoryOffer = product?.category?.offer?.discountPercentage || 0;
      const offerExpirationDate = product?.offer?.endDate || product?.category?.offer?.endDate;

      const priceDetails = calculateOfferPrice(
        product.salePrice,
        productOffer,
        categoryOffer,
        offerExpirationDate
      );

      const originalPrice = product.salePrice * item.quantity;
      const discountedPrice = priceDetails.discountedPrice
        ? priceDetails.discountedPrice * item.quantity
        : originalPrice;

      originalTotalPrice += originalPrice;
      totalPriceAfterDiscount += discountedPrice;
      savedTotal += originalPrice - discountedPrice;

      return {
        ...item.toObject(),
        ...priceDetails,
        offerValid: priceDetails.offerPercentage > 0,
      };
    });

    let finalPrice = totalPriceAfterDiscount + deliveryCharge;

    // Apply coupon if it exists
    let couponDiscount = 0;
    if (cart.appliedCoupon && cart.appliedCoupon.couponId) {
      couponDiscount = cart.appliedCoupon.discount;
      finalPrice -= couponDiscount;
      finalPrice = Math.max(finalPrice, 0);
    }

    return res.status(200).json({
      cart: {
        ...cart.toObject(),
        items: results,
      },
      originalTotalPrice,   
      totalPriceAfterDiscount,
      savedTotal,
      deliveryCharge,
      couponDiscount,
      finalPrice,
      appliedCoupon: cart.appliedCoupon
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};