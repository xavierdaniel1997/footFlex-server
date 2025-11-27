// index.js

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

app.use(cookieParser())


const allowedOrigins = process.env.CLIENT_ORIGINS
app.use(cors({
    origin : allowedOrigins,
    credentials : true,                
    allowedHeaders: ["Content-Type", "Authorization"]
}))

  

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true })); 

app.get("/", (req, res) => {
    res.json({message: "footflex server starts"})
})

app.use("/api", appRoutes)


app.listen(PORT, () => {
    console.log(`server start running at ${PORT}`)
})             