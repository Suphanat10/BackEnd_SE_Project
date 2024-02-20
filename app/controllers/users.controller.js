const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.usersAll = async (req, res) => {
    try {
        const users = await prisma.users_account.findMany({
            select: {
                user_id: true,
                email: true,
                first_name: true,
                last_name: true,
                gender: true,
                image: true,
            },
            where: {
                permission_id: 1
            }
        });

        if(users.length === 0) {
            return res.status(404).json({ 
                message: "No user found.",
                code : 404
             });
        }
        
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ 
            message: error.message ,
            code: 500
        });
    }
}


exports.get_userById = async (req, res) => {
    try {
        const user_id = parseInt(req.params.user_id);
    

        if (!user_id) {
            return res.status(400).json({
                message: "User id is required.",
                code: 400
            });
        }

        const users = await prisma.users_account.findMany({
            select: {
                user_id: true,
                email: true,
                first_name: true,
                last_name: true,
                gender: true,
                image: true,
            },
            where: {
                user_id: user_id
            }
        });

        if (!users || users.length === 0) {
            return res.status(404).json({
                message: "No user found.",
                code: 404
            });
        }
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
            code: 500
        });
    }
}

exports.get_userBycourse_id = async (req, res) => {
    try {
        const course_id = parseInt(req.params.course_id);
        

        if (!course_id) {
            return res.status(400).json({
                message: "Course id is required.",
                code: 400
            });
        }

        const users = await prisma.users_account.findMany({
            select: {
                user_id: true,
                email: true,
                first_name: true,
                last_name: true,
                gender: true,
                image: true,
            },
            where: {
                user_id: user_id
            }
        });

        if (!users || users.length === 0) {
            return res.status(404).json({
                message: "No user found.",
                code: 404
            });
        }

        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
            code: 500
        });
    }
}




            



