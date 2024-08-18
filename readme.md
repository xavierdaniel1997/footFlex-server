import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

export const createOrder = async (req, res) => {
  try {
    const { items, address, totalPrice, payment } = req.body;
    const userId = req.user.id; // Assuming you're using authentication middleware

    // Validate input
    if (!items || !address || !totalPrice || !payment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check stock and update product quantities
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${product.productName}` });
      }
      product.stock -= item.quantity;
      
      // Update size-specific stock
      const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
      if (sizeIndex !== -1) {
        product.sizes[sizeIndex].stock -= item.quantity;
      }
      
      await product.save();
    }

    // Create new order
    const newOrder = new Order({
      user: userId,
      items,
      address,
      totalPrice,
      payment,
      status: 'Pending'
    });

    const savedOrder = await newOrder.save();

    // Clear the user's cart
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

    res.status(201).json({ message: 'Order created successfully', order: savedOrder });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};