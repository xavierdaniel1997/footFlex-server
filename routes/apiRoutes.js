import express from "express";
import userRoute from "./userRoutes.js";
import categoryRoute from "./categoryRoutes.js";
import brandRoute from "./brandRoutes.js"
import productRoute from "./productRoutes.js";
import wishListRoute from "./wishListRoutes.js";
import cartRouter from "./cartRoutes.js";
import orderRouter from "./orderRoutes.js";
import couponRouter from "./couponRoutes.js";
import offerRouter from "./offerRoutes.js";
import salesAndDetialsRouter from "./salesAndDetialsRoutes.js"

const app = express.Router()

app.use("/users", userRoute)
app.use("/category", categoryRoute)
app.use("/brand", brandRoute)
app.use("/product", productRoute)
app.use("/cart", cartRouter)
app.use("/wishList", wishListRoute)
app.use("/order", orderRouter)
app.use("/coupons", couponRouter)
app.use("/offers", offerRouter)
app.use("/salesAndDetials", salesAndDetialsRouter)

export default app;   