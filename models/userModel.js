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
      required: true,
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
        phone: {
          type: String,
        },
        street: {
          type: String,
        },
        city: {
          type: String,
        },
        state: {
          type: String,
        },
        zipCode: {
          type: Number,
        },
        typeofPlace: {
          type: String,
          enum: ["Home", "Work"],
          default: "Home",
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
