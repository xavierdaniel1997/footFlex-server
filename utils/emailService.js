
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



export const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail", 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: '"FootFlex" <your-email@gmail.com>', 
      to: email, 
      subject, 
      text: message, 
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Email could not be sent");
  }
};

