import Cart from "../models/cartModel.js";
import Coupon from "../models/couponModel.js";
import { calculateOfferPrice } from "../utils/calculateOfferPrice.js";

const calculateCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedCouponId } = req.body; // Get selected coupon ID from request body

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
    let priceAfterDiscount = 0;
    let savedTotal = 0;

    cart.items.forEach((item) => {
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
      const discountedPrice = priceDetails.discountedPrice * item.quantity;
      const discount = originalPrice - discountedPrice;

      originalTotalPrice += originalPrice;
      priceAfterDiscount += discountedPrice;
      savedTotal += discount;
    });

    // Initialize coupon discount variables
    let couponDiscount = 0;
    let totalWithCoupon = priceAfterDiscount;

    // Apply the coupon discount if a coupon is selected
    if (selectedCouponId) {
      const selectedCoupon = await Coupon.findById(selectedCouponId);

      if (selectedCoupon) {
        const couponDiscountAmount = Math.min(
          (selectedCoupon.discount / 100) * priceAfterDiscount,
          selectedCoupon.maxDiscountAmount
        );

        couponDiscount = couponDiscountAmount;
        totalWithCoupon = priceAfterDiscount - couponDiscountAmount;
      }
    }

    return res.status(200).json({
      originalTotalPrice,
      priceAfterDiscount,
      savedTotal,
      couponDiscount,       // Return coupon discount
      totalWithCoupon,      // Return total price after applying coupon
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export { calculateCheckout };
