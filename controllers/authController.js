import Users from "../models/userModel.js";
import bcrypt from "bcrypt";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import OTP from "../models/otpModel.js";
import {sendOTPByEmail} from "../utils/emailService.js";
import { generateToken } from "../utils/genetateToken.js";

const registerUser = async (req, res) => {
  try {
    const {firstName, lastName, email, phoneNumber, password, cPassword, role} =
      req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !cPassword
    ) {
      return res.status(400).json({message: "All fields are required"});
    }
    const userExist = await Users.findOne({email: email});
    if (userExist) {
      return res.status(400).json({message: "User already exist"});
    }
    if (password !== cPassword) {
      return res.status(400).json({message: "Different password"});
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new Users({
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: phoneNumber,
      password: hashPassword,
      role,
      isVerified: false,
    });
    const userData = await user.save();

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const otpData = new OTP({email: email, otp: otp});
    await otpData.save();

    await sendOTPByEmail(email, otp);

    return res
      .status(200)
      .json({message: "User registration successfull", userData: userData});
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .json({message: "Failed to register the user", error});
  }
};

const verifyOTP = async (req, res) => {
    
    try{  
        const {otp} = req.body;
        const otpData = await OTP.findOne({otp})
        if(!otpData){  
            return res.status(400).json({message: "Invalid OTP or OTP expired"})
        }
        await Users.updateOne({email: otpData.email}, {isVerified: true})
        await OTP.deleteOne({otp})
        return res.status(200).json({message: "OTP verified successfully"})
    }catch(error){
        console.log(error)
        return res.status(500).json({message: "Failed to verify OTP", error})
    }
}

const resendOTP = async (req, res) => {   
  try{
    const {email} = req.body;
    console.log("otp detials", email) 
    const user = await Users.findOne({email: email, isVerified: false})
    if(!user){
      return res.status(400).json({message: "User not found or already vefified"})
    }
    await OTP.deleteMany({email: email})

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const otpData = new OTP({email: email, otp: otp});
    await otpData.save();

    await sendOTPByEmail(email, otp);
    return res.status(200).json({message: "New OTP send successfully please check your mail"})
  }catch(error){
    console.log(error)
    return res.status(500).json({message: "Failed to resend OTP", error})
  }
}

const loginUser = async (req, res) => {
  try{
    const {email, password} = req.body;
    if(!email || !password){
      return res.status(400).json({message: "All fields are required"})
    }
    const userData = await Users.findOne({email: email, isVerified: true})
    if(!userData){
      return res.status(401).json({message: "User not found"})
    }
    const matchPassword = await bcrypt.compare(password, userData.password)
    if(!matchPassword){
      return res.status(400).json({message: "Invalid password"})
    }
    if(userData.isVerified===false){
      return res.status(400).json({message: "User is not verified"})
    }
    generateToken(res, userData)
    return res.status(200).json({message : "Login successfully", userData: userData})
  }catch(error){
    console.log(error)
    return res.status(500).json({message: "Login failed"})
  }
}

const verifyUser = async (req, res) => {
  try{
      const userId = req.user;
      const userData = await Users.findById(userId.id).select("-password")
      if(!userData){
          return res.status(404).json({message: "user not found"})
      }
      return res.status(200).json({message: "success", user: userData});
  }catch(error){
      console.error(error)
      res.status(500).json({message: "Failed to fetch the user"})
  }

};


const logOutUser = async (req, res) => {
  res.cookie("jwtToken", "", {
    httpOnly: true,
    expires: new Date(0)
  })
  res.status(200).json({message: "logout successfully"})
}

export {registerUser, verifyOTP, resendOTP, loginUser, logOutUser, verifyUser};
