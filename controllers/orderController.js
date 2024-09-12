import Order from "../models/orderModel.js";
import Products from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import Wallet from "../models/walletModel.js";
import Users from "../models/userModel.js";

const createOrder = async (req, res) => {
  console.log("this is frm the createOrder", req.body);
  try {
    const {
      items,
      address,
      totalPrice,
      originalTotalPrice,
      totalPriceAfterDiscount,
      savedTotal,
      couponDiscount,
      finalPrice,
      payment,
    } = req.body;
    const userId = req.user.id;

    if (!items || !address || !totalPrice || !payment) {
      return res.status(400).json({message: "Missing required fields"});
    }

    const orderItems = [];

    for (const item of items) {
      const product = await Products.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({message: `Product ${item.product} not found`});
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${product.productName}`,
        });
      }
      product.stock -= item.quantity;

      const sizeIndex = product.sizes.findIndex((s) => s.size === item.size);
      if (sizeIndex !== -1) {
        product.sizes[sizeIndex].stock -= item.quantity;
      }

      await product.save();

      orderItems.push({
        product: item.product,
        productName: item.productName,
        productBrand: item.productBrand,
        description: item.description,
        price: item.price,
        regularPrice: item.regularPrice,
        quantity: item.quantity,
        size: item.size,
        totalPrice: item.totalPrice,
        thumbnail: item.thumbnail,
      });
    }


    if (payment.method === 'Wallet') {
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet || wallet.balance < finalPrice) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }

      wallet.balance -= finalPrice;

      wallet.transactions.push({
        type: "Purchase",
        amount: finalPrice,
        description: `Order payment for order at ${new Date().toLocaleString()}`,
      });

      await wallet.save();
    }

    const newOrder = new Order({
      user: userId,
      items: orderItems,
      address,
      totalPrice,
      originalTotalPrice,
      totalPriceAfterDiscount,
      savedTotal,
      couponDiscount,
      finalPrice,
      payment,
      status: "Pending",
    });

    const savedOrder = await newOrder.save();

    await Cart.findOneAndUpdate(
      {user: userId},
      {$set: {items: [], couponDiscount: 0}}
    );

    res
      .status(200)
      .json({message: "Order created successfully", order: savedOrder});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Failed to create order"});
  }
};

const razorpay = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_SECRET_KEY,
});   
const verifyRazorpayPayment = async (req, res) => {
  const userId = req.user.id;
  const {totalPrice} = req.body;

  if (!totalPrice) {
    return res.status(400).json({message: "Total price is required"});
  }

  const options = {
    amount: totalPrice * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };
  try {
    const razorpayOrder = await razorpay.orders.create(options);
    res.status(200).json({orderId: razorpayOrder.id});
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({message: "Failed to create Razorpay order"});
  }
};

const createRazorpayOrder = async (req, res) => {
  const userId = req.user.id;
  const {razorpayOrderId, razorpayPaymentId, razorpaySignature, orderData} =
    req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RZP_SECRET_KEY)
    .update(razorpayOrderId + "|" + razorpayPaymentId)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    return res.status(400).json({message: "Invalid payment signature"});
  }

  try {
    const newOrder = new Order({
      user: userId,
      ...orderData,
      payment: {
        method: "UPI",
        status: "Completed",
        razorpayOrderId,
        razorpayPaymentId,
      },
      status: "Pending",
    });
    // console.log("this is frm the order creation in verifyrzp", newOrder);

    const savedOrder = await newOrder.save();

    // Update product stock
    for (const item of orderData.items) {
      const product = await Products.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        const sizeIndex = product.sizes.findIndex((s) => s.size === item.size);
        if (sizeIndex !== -1) {
          product.sizes[sizeIndex].stock -= item.quantity;
        }
        await product.save();
      }
    }

    res.status(200).json({message: "Order confirmed", order: savedOrder});
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({message: "Failed to save order"});
  }
};

// get order for user
const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await Order.find({user: userId}).sort({createdAt: -1});
    return res.status(200).json({message: "Success", order});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Something went wrong"});
  }
};

// get all order for admin
const allOrderDetails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Products.countDocuments({});
    const orders = await Order.find()
      .populate("user", "firstName lastName email")
      .sort({createdAt: -1})
      .skip(skip)
      .limit(limit);
    return res.status(200).json({
      message: "success",
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount: totalCount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Something went wrong"});
  }
};

//get order By  Id
const getOrderById = async (req, res) => {
  try {
    const {orderId} = req.params;
    const order = await Order.findById(orderId).populate(
      "user",
      "firstName lastName email phoneNumber"
    );
    if (!order) {
      return res.status(404).json({message: "Order not found"});
    }

    return res.status(200).json({message: "Success", order});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Something went wrong"});
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const {orderId} = req.params;
    const {orderStatus, paymentStatus} = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({message: "Order not found"});
    }

    if (order.status === "Cancelled") {
      return res
        .status(400)
        .json({message: "Order is already cancelled and cannot be updated"});
    }

    if (orderStatus) {
      if (!order.schema.path("status").enumValues.includes(orderStatus)) {
        return res.status(400).json({message: "Invalid order status"});
      }
      order.status = orderStatus;
    }

    if (paymentStatus) {
      if (
        !order.schema.path("payment.status").enumValues.includes(paymentStatus)
      ) {
        return res.status(400).json({message: "Invalid payment status"});
      }
      order.payment.status = paymentStatus;
    }

    const updatedOrder = await order.save();
    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({message: "Failed to update order status"});
  }
};

const updateOrderItemStatus = async (req, res) => {
  const {orderId, productId} = req.params;
  const {status} = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({message: "Order not found"});
    }

    console.log("this is from the updateOrderItemStatus order", order);
    const orderItem = order.items.find(
      (item) => item.product.toString() === productId
    );

    if (!orderItem) {
      return res.status(404).json({message: "Order item not found"});
    }

    // console.log("this is from the updateOrderItemStatus orderItem", orderItem)
    const {quantity, size, price} = orderItem;

    const update = {
      "items.$.status": status,
    };

    switch (status) {
      case "Cancelled":
        update["items.$.cancelledAt"] = new Date();
        break;
      case "Delivered":
        update["items.$.Delivered"] = new Date();
        break;
      case "Return Requested":
        update["items.$.returnRequestedAt"] = new Date();
        break;
      case "Returned":
        update["items.$.returnedAt"] = new Date();
        break;
      case "Return Accepted":
        update["items.$.returnAcceptedAt"] = new Date();
        break;
      case "Return Rejected":
        update["items.$.returnRejectedAt"] = new Date();
        break;
      default:
        break;
    }

    const updatedOrder = await Order.findOneAndUpdate(
      {_id: orderId, "items.product": productId},
      {$set: update},
      {new: true}
    );

    if (status === "Cancelled") {
      const product = await Products.findById(productId);
      // console.log("this is from the updateOrderItemStatus product", product)
      if (!product) {
        return res.status(404).json({message: "Product not found"});
      }

      product.stock += quantity;

      const sizeIndex = product.sizes.findIndex((s) => s.size === size);
      // console.log("this is from the updateOrderItemStatus sizeIndes", sizeIndex)
      if (sizeIndex === -1) {
        return {status: 404, message: "Size not found"};
      }

      product.sizes[sizeIndex].stock += quantity;
      await product.save();

      const userId = order.user;
      const refundAmount = price * quantity;

      let wallet = await Wallet.findOne({user: userId});
      if (!wallet) {
        wallet = new Wallet({
          user: userId,
          balance: refundAmount,
          transactions: [
            {
              type: "Refund",
              amount: refundAmount,
              description: `Refund for cancelled product ${product.productName}`,
            },
          ],
        });
      } else {
        wallet.balance += refundAmount;
        wallet.transactions.push({
          type: "Refund",
          amount: refundAmount,
          description: `Refund for cancelled product ${product.productName}`,
        });
      }
      await wallet.save();
    }

    if (!updatedOrder) {
      return res.status(404).json({message: "Order or Product not found"});
    }

    res
      .status(200)
      .json({message: "Order item status updated", order: updatedOrder});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Something went wrong"});
  }
};

const cancelOrder = async (req, res) => {
  try {
    const {orderId, productId} = req.body;

    const order = await Order.findById(orderId);
    console.log("this is the cancel order", order);

    if (!order) {
      return res.status(404).json({message: "Order not found"});
    }

    const item = order.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({message: "Product not found in the order"});
    }

    if (item.status !== "Active") {
      return res.status(400).json({message: "Item cannot be cancelled"});
    }

    item.status = "Cancelled";
    item.cancelledAt = new Date();

    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({message: "Product not found"});
    }

    product.stock += item.quantity;

    const sizeIndex = product.sizes.findIndex((s) => s.size === item.size);
    if (sizeIndex === -1) {
      return res.status(404).json({message: "Size not found"});
    }

    product.sizes[sizeIndex].stock += item.quantity;
    await product.save();

    const refundAmount = item.price * item.quantity;
    const userId = order.user;

    let wallet = await Wallet.findOne({user: userId});
    if (!wallet) {
      wallet = new Wallet({
        user: userId,
        balance: refundAmount,
        transactions: [
          {
            type: "Refund",
            amount: refundAmount,
            description: `Refund for cancelled product ${product.productName}`,
          },
        ],
      });
    } else {
      wallet.balance += refundAmount;
      wallet.transactions.push({
        type: "Refund",
        amount: refundAmount,
        description: `Refund for cancelled product ${product.productName}`,
      });
    }
    await wallet.save();

    await order.save();

    return res
      .status(200)
      .json({message: "Product cancelled successfully", order});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Something went wrong"});
  }
};

const returnOrder = async (req, res) => {
  try {
    console.log("this is frm the return ordere", req.body);
    const {orderId, productId, reason} = req.body;

    const order = await Order.findOne({
      _id: orderId,
      "items.product": productId,
    });

    if (!order) {
      return res.status(404).json({message: "Order or product not found"});
    }

    const itemIndex = order.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({message: "Item not found in the order"});
    }

    order.items[itemIndex].status = "Return Requested";
    order.items[itemIndex].returnReason = reason;
    order.items[itemIndex].returnRequestedAt = new Date();

    await order.save();


    return res.status(200).json({message: "Return requested successfully"});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Something went wrong"});
  }
};

export {
  createOrder,
  userOrders,
  allOrderDetails,
  getOrderById,
  updateOrderStatus,
  updateOrderItemStatus,
  createRazorpayOrder,
  verifyRazorpayPayment,
  cancelOrder,
  returnOrder,
};
