const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const nodemailer = require("nodemailer");


exports.delete_google = async (req, res) => {
  try {
    const user_id = req.user_id;

    const updateUser = await prisma.users_account.update({
      where: {
        user_id: user_id,
      },
      data: {
        google_id: null,
      },
    });
    res.status(200).send({
      message: "Google Account was deleted successfully!",
      code: 200,
    });
    const currentDate = new Date();
    const sevenHoursAheadDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
    const saveLogs = await prisma.logs.create({
      data: {
        log_description: "ยกเลิกการเชื่อต่อ Google Account",
        user_id: user_id,
        ip_address: req.ip,
        timestamp: sevenHoursAheadDate
      },
    });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while delete the Google Account.",
      code: 500,
    });
  }
};

exports.register_by_google = async (req, res) => {
  try {
    const google_id = req.body.google_id;
    const email = req.body.google_email;
    const user_id = req.user_id;

    if (!google_id) {
      return res.status(403).send({
        message: "Google ID is required!",
        code: 403,
      });
    }

    const updateUser = await prisma.users_account.update({
      where: {
        user_id: user_id,
      },
      data: {
        google_id: google_id,
        email: email,
      },
    });

    res.status(200).send({
      message: "Google Account was registered successfully!",
      code: 200,
    });
    const currentDate = new Date();
      const sevenHoursAheadDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
    const saveLogs = await prisma.logs.create({
      data: {
        log_description: "การเชื่อต่อ Google Account",
        user_id: user_id,
        ip_address: req.ip,
        timestamp: sevenHoursAheadDate
      },
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while register the User.",
      code: 500,
    });
  }
};

exports.login_by_google = async (req, res) => {
  try {
    const google_id = req.body.google_id;

    const user = await prisma.users_account.findFirst({
      where: {
        google_id: google_id,
      },
    });

    if (!user) {
      return res.status(404).send({
        message: "User Not found.",
        code: 404,
      });
    }

    var token = jwt.sign({ id: user.user_id }, config.secret, {
      expiresIn: 86400,
    });

    res
      .status(200)
      .cookie("accessToken", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
        httpOnly: false,
        sameSite: "none",
        secure: false,
      })
      .send({
        id: user.user_id,
        name: user.prefix + " " + user.first_name + " " + user.last_name,
        email: user.email,
        gender: user.gender,
        permission: user.permission_id,
        accessToken: token,
      });
      const currentDate = new Date();
      const sevenHoursAheadDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
    const saveLogs = await prisma.logs.create({
      data: {
        log_description: "เข้าสู่ระบบโดยใช้ Google Account",
        user_id: user.user_id,
        ip_address: req.ip,
        timestamp: sevenHoursAheadDate
      },
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while login the User.",
      code: 500,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const user = await prisma.users_account.findUnique({
      where: {
        username: username,
      },
    });
    if (!user) {
      return res.status(404).send({
        message: "User Not found.",
        code: 404,
      });
    }

    var passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        code: 401,
        message: "Invalid Password!",
      });
    }

    var token = jwt.sign({ id: user.user_id }, config.secret, {
      expiresIn: 86400,
    });

    res
      .status(200)
      .cookie("accessToken", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
        httpOnly: false,
        sameSite: "none",
        secure: false,
      })
      .send({
        id: user.user_id,
        name: user.prefix + " " + user.first_name + " " + user.last_name,
        email: user.email,
        gender: user.gender,
        permission: user.permission_id,
        accessToken: token,
      });
      const currentDate = new Date();
      const sevenHoursAheadDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
    const saveLogs = await prisma.logs.create({
      data: {
        log_description: "เข้าสู่ระบบ",
        user_id: user.user_id,
        ip_address: req.ip,
        timestamp: sevenHoursAheadDate
      },
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while login the User.",
      code: 500,
    });
  }
};

exports.register = async (req, res) => {
  try {
    const password = req.body.password;
    const username = req.body.username;
    const confirm_password = req.body.confirm_password;
    const prefix = req.body.prefix;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const gender = req.body.gender;
    const permission_id = req.body.permission_id;

    if (
      !password ||
      !username ||
      !confirm_password ||
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

    if (password !== confirm_password) {
      return res.status(403).send({
        message: "Password and Confirm Password are not match!",
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

    var token = jwt.sign({ id: createUser.user_id }, config.secret, {
      expiresIn: 86400,
    });

    res
      .status(200)
      .cookie("accessToken", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
        httpOnly: false,
        sameSite: "none",
        secure: false,
      })
      .send({
        message: "User was registered successfully!",
        id: createUser.user_id,
        name:
          createUser.prefix +
          " " +
          createUser.first_name +
          " " +
          createUser.last_name,
        email: createUser.email,
        gender: createUser.gender,
        permission: createUser.permission_id,
        accessToken: token,
      });
      const currentDate = new Date();
      const sevenHoursAheadDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
    const saveLogs = await prisma.logs.create({
      data: {
        log_description: "ลงทะเบียนผู้ใช้งานใหม่",
        user_id: createUser.user_id,
        ip_address: req.ip,
        timestamp: sevenHoursAheadDate
      },
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the User.",
      code: 500,
    });
  }
};

exports.Forgot_password = async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;

    let transporter = nodemailer.createTransport({
      host: 'mail.wutthiphon.space',
      port: 587,
      secure: false,
      auth: {
          user: 'project@wutthiphon.space',
          pass: '6504062620116'
        
      },
  });

    const user = await prisma.users_account.findFirst({
      where: {
        username: username,
        email: email,
      },
    });

    console.log(user.email);

    if (!user) {
      return res.status(404).send({
        message: "User Not found.",
        code: 404,
      });
    }

    const randomPassword = Math.random().toString(36).slice(-12);
    const newPassword = bcrypt.hashSync(randomPassword, 8);

    const updateUser = await prisma.users_account.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        password: newPassword,
      },
    });

    
    transporter.sendMail({
      from: "project@wutthiphon.space" ,
      to: user.email,
      subject: 'Reset Password',
      html: `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="content">
  
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main">
  
              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <p><b>เปลี่ยนรหัสผ่าน</b></p>
                  <p>
                    คูณได้ทำการรีเซ็ตรหัสผ่านของคุณ<br>
                    รหัสผ่านใหม่ของคุณคือ <b> ${randomPassword}</b>
                  </p>
                
                  <p>Thank You.</p>
                </td>
              </tr>
  
              <!-- END MAIN CONTENT AREA -->
            </table>
  
            <!-- START FOOTER -->
            <div class="footer">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content-block powered-by">
                    E-Learning
                  </td>
                </tr>
              </table>
        
      `,      
      
   

      // text: `Your new password is ${randomPassword}`,
    }, (err, info) => {
      if (err) {
          console.log(err);
      } else {
           res.status(200).send({
            message: "Send email successfully!",
            code: 200,
          });
      }
  });


  const currentDate = new Date();
  const sevenHoursAheadDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
    const saveLogs = await prisma.logs.create({
      data: {
        log_description: "ลืมรหัสผ่าน",
        user_id: user.user_id,
        ip_address: req.ip,
        timestamp: sevenHoursAheadDate 
      },
    });
  } catch (err) {
    res.status(500).send({
      message: err.message ,
      code: 500,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.status(200).send({
      message: "User was logout successfully!",
      code: 200,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while logout the User.",
      code: 500,
    });
  }
};
