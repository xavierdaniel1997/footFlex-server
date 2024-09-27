import jwt from "jsonwebtoken"; 

const isAuth = (req, res, next) => {
    console.log("this is the req of the isAuth", req)
    const token = req.cookies.jwtToken;
    console.log("this is the token from the isAuth", token)
    if(!token){
        return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        req.user = decoded
        console.log("form the isAuth req.user", req.user)
        next()
    }catch(error){
        return res.status(401).json({ message: "Token is not valid" });
    }
}


const isAdminAuth = (req, res, next) => {
    if(req.user && req.user.role){
        next()
    }else{
        res.status(401).json({message: "Not autherized as an admin"})
    }
}
   
export {isAuth, isAdminAuth}