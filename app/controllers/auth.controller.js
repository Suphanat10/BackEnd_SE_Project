const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.login = async (req, res) => {
    try{
        const username = req.body.username;
        const password = req.body.password;
    
        const user = await prisma.users_account.findUnique({
            where: {
                username: username
            }
        })
        if (!user) {
            return res.status(404).send({ 
                message: "User Not found.",
                code : 404
             });
        }
    
        var passwordIsValid = bcrypt.compareSync(
            password,
            user.password
        );
    
        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                code: 401,
                message: "Invalid Password!"
            });
        }
    
        var token = jwt.sign({ id: user.user_id }, config.secret, {
            expiresIn: 86400 // 24 hours
        });
    
        res.status(200).send({
            id: user.user_id,
            name: user.prefix + " " + user.first_name + " " + user.last_name,
            email: user.email,
            gender: user.gender, 
            permission : user.permission_id,
            accessToken: token
        });
    
    } catch (err) {
        res.status(500).send({ 
            message: err.message || "Some error occurred while login the User.",
            code : 500
         });
    }

   
};

exports.login_google = async (req, res) => {
     
    
}



exports.register = async (req, res) => {
    try {
        const user = {
            username: req.body.username,
            gender : req.body.gender,
            password: bcrypt.hashSync(req.body.password, 8),
            prefix: req.body.prefix,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            permission_id: req.body.permission_id
        }
        const checkUsername = await prisma.users_account.findUnique({
            where: {
                username: user.username
            }
        })
        if (checkUsername) {
            return res.status(403).send({ 
                message: "Username is already in use!",
                code : 403
             });
        }
        const createUser = await prisma.users_account.create({
            data: user
        })
        res.status(200).send({ 
            message: "User was registered successfully!",
            code : 200
            });
    }
    catch (err) {
        res.status(500).send({ 
            message: err.message || "Some error occurred while creating the User.",
            code : 500
         });
    }


};






