import express from "express";
import userRoute from "./userRoutes.js";
import categoryRoute from "./categoryRoutes.js";
import brandRoute from "./brandRoutes.js"
const app = express.Router()

app.use("/users", userRoute)
app.use("/category", categoryRoute)
app.use("/brand", brandRoute)

export default app;