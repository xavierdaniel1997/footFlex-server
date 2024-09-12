import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  balance: {
    type: Number,
    default: 0, 
  },
  transactions: [
    {
      type: {
        type: String,
        enum: ["Refund", "Purchase"],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      description: {
        type: String,
      },
    },
  ],
});

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
