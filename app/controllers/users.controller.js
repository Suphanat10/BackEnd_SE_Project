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

// exports. userById = async (req, res) => {
//     try {
//         const user_id = req.params.user_id;
//         const user = await prisma.users_account.findUnique({
//             where: {
//                 user_id: user_id
//             },
//             select: {
//                 user_id: true,
//                 email: true,
//                 first_name: true,
//                 last_name: true,
//                 gender: true,
//                 image: true,
//             }
//         });

//         if (!user) {
//             return res.status(404).json({
//                 message: "No user found.",
//                 code: 404
//             });
//         }
//         res.status(200).json(user);
//     }
//     catch (error) {
//         res.status(500).json({
//             message: error.message,
//             code: 500
//         });
//     }
// }

            



