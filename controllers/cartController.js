import Cart from "../models/cartModel.js";
import Products from "../models/productModel.js";

const addToCart = async (req, res) => {
  try {
    const {productId, quantity, size} = req.body;
    const userId = req.user.id;
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(400).json({message: "Product not found"});
    }
    if (product.stock < quantity) {
      return res.status(400).json({message: "Insufficent stock"});
    }

    let cart = await Cart.findOne({user: userId});

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{productId, quantity, size}],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId && item.size === size
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({productId, quantity, size});
      }
    }
    await cart.save();
    return res.status(200).json({message: "Added to Cart"});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Failed to add to cart"});
  }
};

const getCartDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({user: userId}).populate({
      path: "items.productId",
      populate: {path: "brand"},
    });
    if (!cart) {
      return res.status(400).json({message: "Cart items not found"});
    }
    return res.status(200).json({cart});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Some thing went wrong"});
  }
};

const removeFromCart = async (req, res) => {
  try {
    const {productId} = req.params;
    const userId = req.user.id;
    const cart = await Cart.findOneAndUpdate(
      {user: userId},
      {$pull: {items: {productId}}}
    );
    if (!cart) {
      return res.status(404).json({message: "Cart not found"});
    }

    res.status(200).json({message: "Item removed from cart", cart});
  } catch (error) {
    console.log(error);
  }
};

const updateCart = async (req, res) => {
  try {
    const {productId} = req.params;
    const {size, quantity} = req.body; 
    const userId = req.user.id;

    const cart = await Cart.findOne({user: userId});
    if (!cart) {
      return res.status(404).json({message: "Cart not found"});
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId 
    );


    // if(itemIndex > -1){
    //   if(size)cart.items[itemIndex].size = size;
    //   if(quantity)cart.items[itemIndex].quantity = quantity;
    // }else{
    //   cart.items.push({productId, size, quantity})
    // }   
    if (itemIndex > -1) {
      if (size) cart.items[itemIndex].size = size;                    
      if (quantity !== undefined) {
        // Convert quantity to a number and ensure it's at least 1
        cart.items[itemIndex].quantity = Math.max(1, Number(quantity));
      }
    } else {
      cart.items.push({
        productId,
        size,
        quantity: Math.max(1, Number(quantity))
      });
    }

    await cart.save() 

    await cart.populate({
      path: 'items.productId',                                     
      populate: { path: 'brand' }
    });
    
    return res
      .status(200)
      .json({
        message: "Updated Successfully",
        cart: cart
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Failed to update cart"});
  }
};

export {addToCart, getCartDetails, removeFromCart, updateCart};     
