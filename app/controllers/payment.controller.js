const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//submit doc
exports.submit_document = async (req, res) => {

    try {
        const img_payment = req.body.img_payment;
        const  registration_id = req.body.registration_id;


        const submit = await prisma.users_reg_transfer_document.create({
            data: {
                registration_id: registration_id,
                transfer_document: img_payment,
                comment : null
            }
        });

        const data = await prisma.users_reg_transfer_document.findFirst({
            where: {
                registration_id: registration_id
            }
        });


        res.status(200).send({
            message: "Submit complete", 
            code: 200,
            data: data

        })
        
    } catch (error) {
        res.status(500).send({
            message: error.message,
            code: 500
        });
    }
}



// 0 ไม่สำเร็จ
// 1 ลงแล้วแต่ยังไม่จ่ายตั้ง
// 2 จ่ายตังแล้ว

exports.approve = async (req, res) => {
    try {
        const registration_id = req.body.registration_id

            const update = await prisma.course_reg.update({
                where: {
                    registration_id: registration_id
                },
                data: {
                    registration_status: 2
                }
            });
            return  res.status(200).send({
            message: "Approve complete", 
            status: true,
            })
    
    } catch (error) {
        res.status(500).send({
            message: error.message,
            code: 500
        });
    }
}

exports.reject = async (req, res) => {
    try {
        const registration_id = req.body.registration_id
        const  comment = req.body.comment;




         
        
    
    } catch (error) {
        res.status(500).send({
            message: error.message,
            code: 500
        });
    }
}


    
     






