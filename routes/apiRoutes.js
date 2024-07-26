import express from "express";
import userRoute from "./userRoutes.js";
import categoryRoute from "./categoryRoutes.js";
import brandRoute from "./brandRoutes.js"
import productRoute from "./productRoutes.js"
const app = express.Router()

app.use("/users", userRoute)
app.use("/category", categoryRoute)
app.use("/brand", brandRoute)
app.use("/product", productRoute)

export default app;   