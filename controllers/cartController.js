import Cart from "../models/cartModel.js";
import Products from "../models/productModel.js";
import { calculateOfferPrice } from "../utils/calculateOfferPrice.js";

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
    return res.status(200).json({message: "Added to Cart", cart});
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
      populate: [
        {path: "brand"},
        {path: "offer"},
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
      return res.status(400).json({message: "Cart items not found"});
    }


    const results = cart?.items?.map((product) => {
      const productOffer = product?.productId?.offer?.discountPercentage || 0;
      const categoryOffer = product?.productId?.category?.offer?.discountPercentage || 0;
      const offerExpirationDate =
        product?.productId?.offer?.endDate || product?.productId?.category?.offer?.endDate;
      const priceDetails = calculateOfferPrice(
        product?.productId?.salePrice,
        productOffer, 
        categoryOffer,
        offerExpirationDate
      );
      return {
        ...product.toObject(),
        ...priceDetails,
        offerValid: priceDetails.offerPercentage > 0,
      };
    });
        
    console.log("this is frm the cart getting", results) 

    return res.status(200).json({cart: {
      ...cart.toObject(),
      items: results, 
    }});
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

    if (itemIndex > -1) {
      if (size) cart.items[itemIndex].size = size;
      if (quantity !== undefined) {
        cart.items[itemIndex].quantity = Math.max(1, Number(quantity));
      }
    } else {
      cart.items.push({
        productId,
        size,
        quantity: Math.max(1, Number(quantity)),
      });
    }

    await cart.save();

    await cart.populate({
      path: "items.productId",
      // populate: {path: "brand"},
      path: "items.productId",
      populate: [
        {path: "brand"},
        {path: "offer"},
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


    const results = cart?.items?.map((product) => {
      const productOffer = product?.productId?.offer?.discountPercentage || 0;
      const categoryOffer = product?.productId?.category?.offer?.discountPercentage || 0;
      const offerExpirationDate =
        product?.productId?.offer?.endDate || product?.productId?.category?.offer?.endDate;
      const priceDetails = calculateOfferPrice(
        product?.productId?.salePrice,
        productOffer, 
        categoryOffer,
        offerExpirationDate
      );
      return {
        ...product.toObject(),
        ...priceDetails,
        offerValid: priceDetails.offerPercentage > 0,
      };
    });

    return res.status(200).json({
      message: "Updated Successfully",
      // cart: cart,  
      cart: {
        ...cart.toObject(),
        items: results, 
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Failed to update cart"});
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOneAndUpdate(
      {user: userId},
      {$set: {items: []}},
      {new: true}
    );

    if (!cart) {
      return res.status(404).json({message: "Cart not found"});
    }

    return res.status(200).json({
      message: "Cart cleared successfully",
      cart: cart,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({message: "Failed to clear cart"});
  }
};

export {addToCart, getCartDetails, removeFromCart, updateCart, clearCart};
