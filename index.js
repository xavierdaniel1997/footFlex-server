import express from "express";
import dotenv from "dotenv"
import connectDB from "./config/connectDB.js";
import appRoutes from "./routes/apiRoutes.js";

const app = express();
 
const PORT = 8000;
dotenv.config()
connectDB()
app.use(express.json())
app.get("/", (req, res) => {
    res.json({message: "footflex server starts"})
})
app.use("/api", appRoutes)


app.listen(PORT, () => {
    console.log(`server start running at ${PORT}`)
}) 