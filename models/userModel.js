import mongoose, {mongo} from "mongoose";

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: false,
    },
    dpImage: {
      type: String,
      required: false,
    },
    addresses: [
      {
        customerName : {
          type: String,
        },
        phone: {
          type: Number,
          required: true,
        },
        address: {
          type: String,
          required: true,
        },
        locality: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        pinCode: {
          type: Number,
        },
        typeofPlace: {
          type: String,
          enum: ["home", "work"],    
          default: "home",
        },
        isDefaultAddress: {
          type: Boolean,
          default: false,
        },
      },                                    
    ],
    password: {
      type: String,
      required: true,
    },
    role: {
      type: Boolean,
      required: true,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Users = mongoose.model("Users", userSchema);
export default Users;
