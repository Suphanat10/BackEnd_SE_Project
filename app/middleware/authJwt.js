const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    
    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }
    
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.user_id = decoded.id;
        next();
    });
}

const isAdmin = async (req, res, next) => {
     const user_id =parseInt(req.user_id);
    try {
        const user = await prisma.users_account.findUnique({
            where: {
                user_id: user_id
            }
        });

        if(user.length==0){
            return res.status(403).send({ message: "Require Admin Role!" });
        }
        next();
    } catch (error) {
        return res.status(500).send({ 
            message:error.message,
            code: 500
         });
    }
}

const isTutor = async (req, res, next) => {
    try {
        const user_id =parseInt(req.user_id);
        const user = await prisma.users_account.findUnique({
            where: {
                user_id: user_id
               
            }
        });
        if(user.length==0){
            return res.status(403).send({ message: "Require Tutor Role!" });
        }

        next();
    } catch (error) {
 
        return res.status(500).send({ 
            message:error.message,
            code: 500
         });
    }
}

const isStudent = async (req, res, next) => {
    try {
        const user_id =parseInt(req.user_id);
        const user = await prisma.users_account.findUnique({
            where: {
                user_id: user_id
               
            }
        });
        if(user.length==0){
            return res.status(403).send({ message: "Require Student Role!" });
        }
        next();
    } catch (error) {
        return res.status(500).send({ 
            message:error.message,
            code: 500
         });
    }
}






const authJwt = {
    verifyToken,
    isAdmin,
    isTutor,
    isStudent
};

module.exports = authJwt;





