import express from "express";
import userRoute from "./userRoutes.js";
import categoryRoute from "./categoryRoutes.js";
import brandRoute from "./brandRoutes.js"
import productRoute from "./productRoutes.js";
import wishListRoute from "./wishListRoutes.js";
import cartRouter from "./cartRoutes.js"
const app = express.Router()

app.use("/users", userRoute)
app.use("/category", categoryRoute)
app.use("/brand", brandRoute)
app.use("/product", productRoute)
app.use("/cart", cartRouter)
app.use("/wishList", wishListRoute)

export default app;   