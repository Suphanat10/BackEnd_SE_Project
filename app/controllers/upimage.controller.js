const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



exports.upload_course = async (req, res) => {
    
    res.status(200).send({
      status: true,
      image :req.file.filename
    
    });
  };






