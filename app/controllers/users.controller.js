const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
var bcrypt = require("bcryptjs");

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
    const prefix = req.body.prefix;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const gender = req.body.gender;

   

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
    // const user_id = parseInt(req.params.user_id);
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

exports.create_user = async (req, res) => {
  try {
    const password = req.body.password;
    const username = req.body.username;
    const prefix = req.body.prefix;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const gender = req.body.gender;
    const permission_id = 3;

    if (
      !password ||
      !username ||
      !prefix ||
      !first_name ||
      !last_name ||
      !email ||
      !permission_id ||
      !gender
    ) {
      return res.status(403).send({
        message: "All field is required!",
        code: 403,
      });
    }

    const checkUsername = await prisma.users_account.findUnique({
      where: {
        username: username,
      },
    });

    if (checkUsername) {
      return res.status(403).send({
        message: "Username is already in use!",
        code: 403,
      });
    }

    const createUser = await prisma.users_account.create({
      data: {
        prefix: prefix,
        first_name: first_name,
        last_name: last_name,
        email: email,
        username: username,
        password: bcrypt.hashSync(password, 8),
        permission_id: permission_id,
        gender: gender,
      },
    });


    res.status(200).send({
      message: "User registered successfully",
      code: 200,
    });

  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the User.",
      code: 500,
    });
  }
};





 






























