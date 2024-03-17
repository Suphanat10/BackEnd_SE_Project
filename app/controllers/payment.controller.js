const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.submit_document = async (req, res) => {

    try {
        const img_payment = req.body.img_payment;
        const registration_id = req.body.registration_id;

        const submit = await prisma.users_reg_transfer_document.create({
            data: {
                registration_id: registration_id,
                transfer_document: img_payment,
                comment: null
            }
        });

        const update_status = await prisma.course_reg.update({
            where: {
                registration_id: registration_id
            },
            data: {
                registration_status: 1
            }
        });

        res.status(200).send({
            message: "Submit complete",
            code: 200,

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
        return res.status(200).send({
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
        const registration_id = req.body.registration_id;
        const comment = req.body.comment;

        const update_data = await prisma.users_reg_transfer_document.updateMany({
            where: {
                registration_id: registration_id,
                comment: null
            },
            data: {
                comment: comment
            }
        });
        
        const update__status = await prisma.course_reg.update({
            where: {
                registration_id: registration_id
            },
            data: {
                registration_status: 0
            }
        });

        return res.status(200).send({
            message: "Reject complete",
            status: true
        });

    } catch (error) {
        res.status(500).send({
            message: error.message,
            code: 500
        });
    }
}










