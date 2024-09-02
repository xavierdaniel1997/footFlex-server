import Coupon from "../models/couponModel.js";

const addCoupon = async (req, res) => {
    console.log(req.body)
  try {
    const {
      couponName,
      couponCode,
      discount,
      minPurchaseAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      status,  
      description
    } = req.body;

    if (
      !couponName ||
      !couponCode ||
      !discount ||
      !minPurchaseAmount ||
      !maxDiscountAmount ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({message: "All fields are required"});
    }

    const existingCoupon = await Coupon.findOne({couponCode});
    if (existingCoupon) {
      return res.status(400).json({message: "Coupon code already exists"});
    }

    const coupons = new Coupon({
        couponName,
        couponCode,
        discount,
        minPurchaseAmount,
        maxDiscountAmount,
        startDate,
        endDate,
        status,
        description,
      });

      await coupons.save()
    return res.status(200).json({message: "coupon added Succesfully", coupons});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Failed to add coupon"});
  }
};


const getCouponsAdmin = async (req, res) => {
    try{
        const coupons = await Coupon.find()
        return res.status(200).json({message: "Success", coupons})
    }catch(error){
        console.log(error)
        return res.status(200).json({message: "Something went wrog"})
    }
}

const deleteCoupon = async (req, res) => {
    try{
        const {couponId} = req.params;
        await Coupon.findByIdAndDelete(couponId)
        return res.status(200).json({message: "Delete Successfully"})
    }catch(error){
        console.log(error)
        return res.status(200).json({message: "Something went wrog"})
    }
}


const getAvailableCoupons = async (req, res) => {
  try{
    const userId = req.user.id;
    const { totalPrice } = req.query; 

    if (!totalPrice) {
      return res.status(400).json({ message: "Total price is required" });
    }

    const availableCoupons = await Coupon.find({
      minPurchaseAmount: { $lte: totalPrice },
      // startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      status: true,
      usedBy: { $ne: userId },
    })

    if (!availableCoupons.length) {
      return res.status(404).json({ message: "No coupons available" });
    }

    return res.status(200).json({ message: "Coupons found", coupons: availableCoupons });
    
  }catch(error){
    console.error(error);
    return res.status(500).json({ message: "Failed to retrieve coupons" });
  }
}


const applyCoupon = async (req, res) => {
  try{
    return res.status(200).json({ message: "Coupons apply successfully"});
  }catch(error){
    console.log(error)
    return res.status(500).json({ message: "Failed to applay coupons" });
  }
}

export {addCoupon, getCouponsAdmin, deleteCoupon, getAvailableCoupons, applyCoupon};
