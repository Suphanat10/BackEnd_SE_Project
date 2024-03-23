const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.get_user = async (req, res) => {
  try {
    const  user = await prisma.users_account.findMany({
      select: {
        user_id: true,
        prefix: true,
        first_name: true,
        last_name: true,
        email: true,
        image: true,
        permission_id: true,
        gender : true,
        username : true,
      }
    }); 

    res.status(200).send(user);


  
  }
  catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving user registration."
    });
  }
}






























