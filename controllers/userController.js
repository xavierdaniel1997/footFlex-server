import Category from "../models/categoryModel.js";
import Users from "../models/userModel.js";
import { uploadImage } from "../utils/imageUploadUtil.js";

const getUserDetials = async (req, res) => {
  try {
    const userId = req.user;
    const userData = await Users.findById(userId.id).select("-password");
    if (!userData) {
      return res.status(404).json({message: "user not found"});
    }
    return res.status(200).json({message: "success", user: userData});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Failed to fetch the user"});
  }
};

const getAllUser = async (req, res) => {
  try {
    const users = await Users.find({role: false}).select("-password");
    return res
      .status(200)
      .json({message: "fetch user detials successfully", users: users});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Somthing went wrong"});
  }
};

const updateUserDetials = async (req, res) => {
  try {
    const userId = req.user;
    const {firstName, lastName, phoneNumber, dpImage} = req.body;
    const user = await Users.findById(userId.id)
    if(!user){
      return res.status(400).json({message: "User not found"})
    }
    user.firstName = firstName||user.firstName,
    user.lastName = lastName || user.lastName,
    user.phoneNumber = phoneNumber || user.phoneNumber;
    if(dpImage){
      user.dpImage = await uploadImage(
        dpImage,
        "profile",
        600,
        600
      );
    }
    const updatUser = await user.save()
    return res.status(200).json({message: "Updated successfully" , user: updatUser});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Failed to update user"});
  }
};

const blockUser = async (req, res) => {
  try {
    const {id} = req.params;
    const user = await Users.findById(id);
    if (!user) {
      return res.status(400).json({message: "User not found"});
    }
    user.isVerified = !user.isVerified;
    await user.save();
    const verifiedMessage = user.isVerified ? "Active" : "Blocked";
    return res.status(200).json({message: `User is ${verifiedMessage}`, user});
  } catch (error) {
    console.log(error);
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({message: "Invalid user ID format"});
    }

    return res.status(500).json({message: "Failed to block user"});
  }
};

const deleteUser = async (req, res) => {
    try{
        const {id} = req.params;
        await Users.findByIdAndDelete(id)
        return res.status(200).json({message : "Delete User successfully"})
    }catch(error){
        console.log(error)
        return res.status(500).json({message: "Failed to delete User"})
    }
}

export {getUserDetials, getAllUser, updateUserDetials, blockUser, deleteUser};
