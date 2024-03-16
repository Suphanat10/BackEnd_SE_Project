const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");


exports.getProfile = async (req, res) => {
    try {
        const user_id = req.user_id;
        const user = await prisma.users_account.findUnique({
            where: {
                user_id: user_id
            },
            select: {
                user_id: true,
                prefix: true,
                first_name: true,
                last_name: true,
                email: true,
                image: true,
                permission_id: true,
                gender:true,
                image:true,
                username:true,
                google_id:true
            }
        });

        if (!user) {
            return res.status(404).send([]);
        }

        res.status(200).send(user);
    } catch (err) {
        res.status(500).send({
            message: err.message,
            code: 500
        });
    }
}


           




exports.updatePassword = async (req, res) => {
    try{
        const user_id = req.user_id;
        const password = req.body.password;
        const new_password = req.body.new_password;


        if (!user_id || !password || !new_password) {
            return res.status(400).send({
                message: "User ID, Password, and New Password are required!",
                code: 400
            });
        }
        
        const user = await prisma.users_account.findUnique({
            where: {
                user_id: user_id
            }
        });

        if (!user) {
            return res.status(404).send({
                message: "User Not found.",
                code: 404
            });
        }

        let passwordIsValid = bcrypt.compareSync(
             password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                message: "รหัสผ่านไม่ถูกต้อง",
                code: 401
            });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(new_password, salt);

        const updateUser = await prisma.users_account.update({
            where: {
                user_id: user_id
            },
            data: {
                password: hashedPassword
            }
        });

        res.status(200).send({
            message: "Password was updated successfully!",
            code: 200
        });

    } catch (err) {
        res.status(500).send({
            message: err.message,
            code: 500
        });
    }
}


exports.updateProfile = async (req, res) => {
 try {
    const user_id = req.user_id;
    const prefix = req.body.prefix;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const  image = req.body.image;
 


    if (!user_id || !prefix || !first_name || !last_name || !email ) {
        return res.status(400).send({
            message: "User ID, Prefix, First Name, Last Name, Email, and Username are required!",
            code: 400
        });
    }

    const user = await prisma.users_account.findUnique({
        where: {
            user_id: user_id
        }
    });

    if (!user) {
        return res.status(404).send({
            message: "User Not found.",
            code: 404
        });
    }

    const updateUser = await prisma.users_account.update({
        where: {
            user_id: user_id
        },
        data: {
            prefix: prefix,
            first_name: first_name,
            last_name: last_name,
            email: email,
            image:image
        }
    });

    res.status(200).send({
        message: "Profile was updated successfully!",
        code: 200
    });

}catch (err) {
    res.status(500).send({
        message: err.message,
        code: 500
    });
}
}
