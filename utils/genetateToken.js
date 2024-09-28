import jwt from "jsonwebtoken";

export const generateToken = (res, user) => {
    const token = jwt.sign({ id: user._id, role: user.role, username: user.firstName }, process.env.SECRET_KEY, { expiresIn: "1h" })

    res.cookie("jwtToken", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        secure: true,
        maxAge: 60 * 60 * 1000,
        sameSite: 'None'
    })
} 