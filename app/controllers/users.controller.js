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
        google_id : true
      }
    }); 

    res.status(200).send(user);
  
  }
  catch (error) {
    res.status(500).send({
      message: error.message
    });
  }
}


exports.update_user = async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const username = req.body.username;
    const prefix = req.body.prefix;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const gender = req.body


    if (!user_id) {
      res.status(400).send({
        message: "user_id is required",
        code: 400,
      });
      return;
    }


  const  update_user = await prisma.users_account.update({
    where: {
      user_id: user_id
    },
    data: {
      username: username,
      prefix: prefix,
      first_name: first_name,
      last_name: last_name,
      email: email,
      gender :gender
    }
  });

  res.status(200).send({
    message: "User updated successfully",
    code: 200,
  });


  } catch (error) {
    res.status(500).send({
      message: error.message
    });
  }
}

exports.delete_user = async (req, res) => {
  try {
    const user_id = parseInt(req.params.user_id);

    if (!user_id) {
      res.status(400).send({
        message: "user_id is required",
        code: 400,
      });
      return;
    }

    const delete_user = await prisma.users_account.delete({
      where: {
        user_id: user_id
      }
    });

    res.status(200).send({
      message: "User deleted successfully",
      code: 200,
    });

  } catch (error) {
    res.status(500).send({
      message: error.message
    });
  }
}



 






























