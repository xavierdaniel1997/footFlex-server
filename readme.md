// utils/emailService.js
import nodemailer from "nodemailer";

export const sendOTPByEmail = async (email, otp) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let info = await transporter.sendMail({
    from: '"Your App Name" <your-email@gmail.com>',
    to: email,
    subject: "OTP for Registration",
    text: `Your OTP is: ${otp}. It will expire in 1 minute.`,
    html: `<b>Your OTP is: ${otp}</b><br>It will expire in 1 minute.`,
  });

  console.log("Message sent: %s", info.messageId);
};






// controllers/userController.js
import Users from "../models/userModel.js";
import OTP from "../models/otpModel.js";
import bcrypt from "bcrypt";
import otpGenerator from "otp-generator";
import { sendOTPByEmail } from "../utils/emailService.js";

const registerUser = async (req, res) => {
  console.log("body", req.body);
  try {
    const { firstName, lastName, email, phoneNumber, password, cPassword, role } = req.body;
    
    if (!firstName || !lastName || !email || !phoneNumber || !password || !cPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const userExist = await Users.findOne({ email: email });
    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    if (password !== cPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new Users({
      firstName, lastName, email, phoneNumber,
      password: hashPassword,
      role,
      isVerified: false,
    });
    
    const userData = await user.save();
    
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });
    
    const otpData = new OTP({ email: email, otp: otp });
    await otpData.save();
    
    await sendOTPByEmail(email, otp);
    
    return res.status(200).json({ message: "User registered successfully. Please check your email for OTP.", userId: userData._id });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Failed to register the user", error });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const otpData = await OTP.findOne({ email: email, otp: otp });
    
    if (!otpData) {
      return res.status(400).json({ message: "Invalid OTP or OTP expired" });
    }
    
    await Users.updateOne({ email: email }, { isVerified: true });
    
    await OTP.deleteOne({ email: email, otp: otp });
    
    return res.status(200).json({ message: "OTP verified successfully. You can now log in." });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Failed to verify OTP", error });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email: email, isVerified: false });
    if (!user) {
      return res.status(400).json({ message: "User not found or already verified" });
    }

    await OTP.deleteMany({ email: email });

    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });

    const otpData = new OTP({ email: email, otp: otp });
    await otpData.save();

    await sendOTPByEmail(email, otp);

    return res.status(200).json({ message: "New OTP sent successfully. Please check your email." });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Failed to resend OTP", error });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await Users.findOne({ email: email });
    
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    
    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email first" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Generate and send JWT token here
    
    return res.status(200).json({ message: "Login successful", user: user });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Failed to login", error });
  }
};

export { registerUser, verifyOTP, resendOTP, loginUser };