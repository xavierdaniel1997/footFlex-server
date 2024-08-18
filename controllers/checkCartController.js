import Cart from "../models/cartModel.js";
import Products from "../models/productModel.js";

const checkCartItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({user: userId});

    if (!cart) {
      return res.status(400).json({message: "Cart not found"});
    }

    const productIds = cart.items.map((item) => item.productId);
    const products = await Products.find({_id: {$in: productIds}});

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    const stockCheckResults = [];

    for (const cartItem of cart.items) {
      const product = productMap.get(cartItem.productId.toString());

      if (!product) {
        stockCheckResults.push({
          productId: cartItem.productId,
          inStock: false,
          message: "Product not found",
        });
        continue;
      }

      const requestedSize = cartItem.size;
      const requsetedQunatity = cartItem.quantity;

      const sizeObject = product.sizes.find((s) => s.size === requestedSize);

      if (!sizeObject) {
        stockCheckResults.push({
          productId: product._id,
          productName: product.productName,
          inStock: false,
          message: `Size ${requestedSize} is not available for this product.`,
        });
      } else if (sizeObject.stock < requsetedQunatity) {
        stockCheckResults.push({
          productId: product._id,
          productName: product.productName,
          inStock: false,
          message: `Insufficient stock for size ${requestedSize}. Available: ${sizeObject.stock}`,
        });
      } else {
        stockCheckResults.push({
          productId: product._id,
          productName: product.productName,
          inStock: true,
          message: "Item is in stock.",
        });
      }
    }

    const allItemsInStock = stockCheckResults.every((result) => result.inStock);

    return res.status(200).json({
      message: allItemsInStock
        ? "All items are in stock"
        : "Some items are out of stock",
      allItemsInStock,
      stockCheckResults,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Something went wrong"});
  }
};

export {checkCartItems};
