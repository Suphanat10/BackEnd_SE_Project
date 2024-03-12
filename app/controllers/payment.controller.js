const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//submit doc
exports.submit_document = async (req, res) => {
    try {
        const img_payment = req.body.img_payment;
        const  registration_id = req.body.registration_id;


        const submit = await prisma.course_reg.update({
            where: {
                registration_id:registration_id
            },
            data: {
                transfer_document: img_payment
            }
        });

        res.status(200).send({
            message: "Submit complete", 
            code: 200
        })
    } catch (error) {
        res.status(500).send({
            message: error.message,
            code: 500
        });
    }
}


exports.approve = async (req, res) => {
    try {
        const registration_id = req.body.registration_id
        const registration_status = req.body.registration_status
        
        if(registration_status == 1){
            const update_status = await prisma.course_reg.update({
                data:{
                    registration_status:1
                },where:{
                    registration_id:registration_id
                }
            })
            res.status(200).send({
                message: "Approve complete",
                code: 200
            })
        }else{
            const delete_fail_document = await prisma.course_reg.delete({
                where:{
                    registration_id:registration_id
                }
            })
            res.status(200).send({
                message: "Approve not complete, Transfer document not correct",
                code: 200
            })
        }

    } catch (error) {
        res.status(500).send({
            message: error.message,
            code: 500
        });
    }
}