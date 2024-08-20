import Order from "../models/orderModel.js";
import Products from "../models/productModel.js";
import Cart from "../models/cartModel.js";

const createOrder = async (req, res) => {
  console.log("this is frm the createOrder", req.body);
  try {
    const {items, address, totalPrice, payment} = req.body;
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

      console.log("this is frm the loop product", product);
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

    const newOrder = new Order({
      user: userId,
      items: orderItems,
      address,
      totalPrice,
      payment,
      status: "Pending",
    });

    const savedOrder = await newOrder.save();

    await Cart.findOneAndUpdate({user: userId}, {$set: {items: []}});

    res
      .status(200)
      .json({message: "Order created successfully", order: savedOrder});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Failed to create order"});
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
  try{

    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('user', 'firstName lastName email phoneNumber');
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({message: "Success", order});
  }catch(error){
    console.log(error)
    return res.status(500).json({message: "Something went wrong"});
  }
}


const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled and cannot be updated" });
    }

    if (orderStatus) {
      if (!order.schema.path('status').enumValues.includes(orderStatus)) {
        return res.status(400).json({ message: "Invalid order status" });
      }
      order.status = orderStatus;
    }

    if (paymentStatus) {
      if (!order.schema.path('payment.status').enumValues.includes(paymentStatus)) {
        return res.status(400).json({ message: "Invalid payment status" });
      }
      order.payment.status = paymentStatus;
    }

    const updatedOrder = await order.save();
    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

export {createOrder, userOrders, allOrderDetails, getOrderById, updateOrderStatus};
