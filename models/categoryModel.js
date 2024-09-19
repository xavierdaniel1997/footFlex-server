import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean, 
      default: true,
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
