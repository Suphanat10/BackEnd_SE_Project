const { PrismaClient } = require('@prisma/client');
const e = require('express');
const prisma = new PrismaClient();

exports.calculateScore = async (req, res) => {
    try {
        const course_reg_exam_ans_id_get = req.param.course_reg_exam_ans_id;

        const problemAndchoice = await prisma.reg_exam_ans.findFirst({
            select: {
                problem_id: true,
                select_choice: true
            },where:{
                course_reg_exam_ans_id : course_reg_exam_ans_id_get
            }
        })

        let score = 0
        problemAndchoice.problem_id
        
    } catch (error) {

    }

}