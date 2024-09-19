import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brands",
      required: true,
    },
    gender: {
      type: String,
      enum: ["Men", "Women", "Kids"],
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    regularPrice: {type: Number, required: true},
    salesPrice: {
      type: Number,
    },
    salePrice: {type: Number, required: true},
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
    },
    sizes: [
      {
        size: String,
        stock: Number,
      },
    ],
    thumbnail: {
      type: String,
      required: true,
    },
    gallery: [
      { 
        type: String,
      },
    ],
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Products = mongoose.model("Products", productSchema);
export default Products;
