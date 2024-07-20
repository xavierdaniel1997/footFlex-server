import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import appRoutes from "./routes/apiRoutes.js";
import cookieParser from "cookie-parser";

const app = express();
 
const PORT = 8000;
dotenv.config()
connectDB()
app.use(cors({ 
    origin: "http://localhost:3000",
    credentials: true
  }));
  
app.use(express.json())
app.use(cookieParser())
app.get("/", (req, res) => {
    res.json({message: "footflex server starts"})
})
app.use("/api", appRoutes)


app.listen(PORT, () => {
    console.log(`server start running at ${PORT}`)
}) 