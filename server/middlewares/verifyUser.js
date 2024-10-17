import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyUser = (req, res, next) => {
    console.log(req.user);
    const token = req.header("Authorization");
    console.log(token);
    
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }
    try {
        const decoded = jwt.verify(token, "secretkey");
        req.user = { id: decoded.userId };
        console.log(req.user);
        
        console.log("shdkjas hdkj");
        
        next();
    } catch (error) {
        console.log(error);
        
        return res.status(401).json({ message: "No token, authorization denied" });
    }
}
