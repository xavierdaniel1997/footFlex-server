// import mongoose from "mongoose";

// const wishListSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Users",
//       required: true,
//     },
//     products: [{
//       type: mongoose.Schema.Types.ObjectId,  
//       ref: "Products",
//     }],
    
//   },
//   {timestamps: true}
// );

// const WishList = mongoose.model("WishList", wishListSchema);
// export default WishList;




import mongoose from "mongoose";

const wishListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
    }],
  },
  {timestamps: true}
);
  
const WishList = mongoose.model("WishList", wishListSchema);
export default WishList;