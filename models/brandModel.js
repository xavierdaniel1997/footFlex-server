import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      required: true,
    },
    brandTitle: {
      type: String,
      required: false,
    },
    logo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Brands = mongoose.model("Brands", brandSchema);
export default Brands;
