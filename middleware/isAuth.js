import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
    const token = req.cookies.jwtToken;
    if(!token){
        return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        req.user = decoded
        console.log("form mld", req.user)
        next()
    }catch(error){
        return res.status(401).json({ message: "Token is not valid" });
    }
}
   
export {isAuth}