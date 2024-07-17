import mongoose from "mongoose";

const addressSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: false,
    },
    street: {
        type: String,
        requried: true,
    },
    city: {
        type: String,
        requried: true,
    },
    state: {
        type: String,
        requried: true,
    },
    zipCode: {
        type: Number,
        required: true,
    }, 
    typeofPlace: {
        type: String,
        enum: ['Home', 'Work'],
        default: 'Home'
    },
    isDefaultAddress: {
        type: Boolean,
        default: false,
    }
}, {
    timeStamps: true,
})

const Address = mongoose.model("Address", addressSchema);
export default Address;