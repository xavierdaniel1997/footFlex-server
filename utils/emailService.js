
import nodemailer from "nodemailer";

export const sendOTPByEmail  = async (email, otp) => {
    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let info = await transporter.sendMail({
        from: '"FootFlex" <your-email@gmail.com>',
        to: email,
        subject: "OTP for Registration",
        text: `Your OTP is: ${otp}. It will expire in 1 minute.`,
        html: `<b>Your OTP is: ${otp}</b><br>It will expire in 1 minute.`,
    })
}
