import mongoose from "mongoose";

const {Schema} = mongoose;

const addressSchema = new Schema({
  customerName: {type: String, required: true},
  phone: {type: Number, required: true},
  address: {type: String, required: true},
  locality: {type: String, required: true},
  city: {type: String, required: true},
  state: {type: String, required: true},
  pinCode: {type: Number, required: true},
  typeofPlace: {type: String, required: true},
});

const orderItemSchema = new Schema({
  product: {type: Schema.Types.ObjectId, ref: "Products", required: true},
  productName: {type: String, required: true},
  productBrand: {type: String, required: true},
  description: {type: String, required: true},
  price: {type: Number, required: true},
  regularPrice: {type: Number, required: true},
  offerPrice: {type: Number},
  quantity: {type: Number, required: true, min: 1},
  size: {type: String, required: true},
  totalPrice: {type: Number, required: true},
  thumbnail: {type: String, required: true},
  status: {
    type: String,
    enum: [
      "Active",
      "Delivered",
      "Cancelled",
      "Return Requested",
      "Return Accepted",
      "Return Rejected",
      "Returned",
    ],
    default: "Active",
  },
  cancelledAt: {type: Date},
  returnRequestedAt: {type: Date},
  returnedAt: {type: Date},
  returnReason: {type: String},
});

const paymentSchema = new Schema({
  method: {
    type: String,
    enum: ["Cash on Delivery", "Credit Card", "Debit Card", "UPI", "Wallet"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending",
  },
  transactionId: {type: String},
});

const orderSchema = new Schema(
  {
    user: {type: Schema.Types.ObjectId, ref: "Users", required: true},
    items: [orderItemSchema],
    address: {type: addressSchema, required: true},
    totalPrice: {type: Number, required: true},


    originalTotalPrice: {type: Number},
    totalPriceAfterDiscount: {type: Number},
    savedTotal: {type: Number},
    deliveryCharge: {type: Number},
    couponDiscount: {type: Number, default: 0},
    finalPrice: {type: Number},


    status: {
      type: String,
      enum: [
        "Payment Failed",
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Returned",
        "Partially Cancelled",
        "Partially Returned",
      ],
      default: "Pending",
    },
    payment: {type: paymentSchema, required: true},
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
