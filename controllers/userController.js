import Category from "../models/categoryModel.js";
import Users from "../models/userModel.js";

const getUserDetials = async (req, res) => {
    try{
        const userId = req.user;
        const userData = await Users.findById(userId.id).select("-password")
        if(!userData){
            return res.status(404).json({message: "user not found"})
        }
        console.log("frm getUser", userData)
        return res.status(200).json({message: "success", user: userData});
    }catch(error){
        console.error(error)
        res.status(500).json({message: "Failed to fetch the user"})
    }
  
};


export {getUserDetials}   