import Order from "../models/orderModel.js";
import Products from "../models/productModel.js";
import Cart from "../models/cartModel.js";

const createOrder = async (req, res) => {
  // console.log("this is frm the createOrder", req.body);
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

      console.log("this is frm the loop product", product)
      orderItems.push({
        product: item.product,
        productName: item.productName,
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

export {createOrder};
      