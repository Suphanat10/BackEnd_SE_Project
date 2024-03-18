const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.calculateScore = async (req, res) => {

    try {
        const registration_id = parseInt(req.params.registration_id);
        const exam_id = parseInt(req.params.exam_id);
        let score = 0;

        const Ans = await prisma.reg_exam_ans.findMany({
            where: {
              registration_id: registration_id,
              course_exam_problem: {
                exam_id: exam_id
              }
            },
            select: {
              select_choice: true,
              course_exam_problem: {
                select: {
                  problem_name: true,
                  correct_choice: true,
                  course_exam: {
                    select: {
                      exam_name: true,
                      exam_id: true
                    }
                  }
                }
              }
            }
          });
          
        if (!Ans) {
            return res.status(200).send([]);
        }

          let Correct_answer =[];

        for await (const ans of Ans) {
            if (ans.select_choice === ans.course_exam_problem.correct_choice) {
                score += 1;
                Correct_answer.push({exam_id: ans.course_exam_problem.course_exam.exam_id})

            }
        }
        
        if (score >=  Ans.length/2) {
            res.status(200).send({
                message: "ยินดีด้วยคุณผ่านการทำเเบบทดสอบ",
                status_exam: true,
                score: score,
                Correct_answer: Correct_answer
        })
    } else {
        res.status(200).send({
            message: "คุณไม่ผ่านการทำเเบบทดสอบ",
            status_exam: false,
            score: score,
            Correct_answer: Correct_answer
        })
    }
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while calculating score."
        });


    }

}


















