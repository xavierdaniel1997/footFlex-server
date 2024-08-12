// controllers/cartController.js

const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size, quantity } = req.body;
    const userId = req.user.id;
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    const item = cart.items.find(item => item.productId.toString() === productId && item.size === size);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    item.quantity = quantity;
    await cart.save();
    
    return res.status(200).json({ message: "Cart item updated", cart });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to update cart item" });
  }
};

// Add this route to your routes file
// routes/cartRoutes.js
import { updateCartItem } from '../controllers/cartController.js';

router.patch('/cart/:productId', updateCartItem);
