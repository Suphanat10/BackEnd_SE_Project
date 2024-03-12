const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.calculateScore = async (req, res) => {
    
    try {
        const registration_id = parseInt(req.params.registration_id);
        let score = 0;

        const  Ans = await prisma.reg_exam_ans.findMany({
            where: {
                registration_id: registration_id
            },
            select: {
                select_choice: true,
                course_exam_problem: {
                  select: {
                    problem_name: true,
                    correct_choice: true,
                    course_exam: {
                      select: {
                        exam_name: true
                      }
                    }
                  }
                }
              }
        });

        if (!Ans) {
            return res.status(200).send([]);
        }

        Ans.forEach(element => {
            if (element.select_choice == element.course_exam_problem.correct_choice) {
                score += 1;
            }
        });

        if (score >=  Ans.length/2) {
            res.status(200).send({
                message: "ยินดีด้วยคุณผ่านการทำเเบบทดสอบ",
                score: score,
        })
    } else {
        res.status(200).send({
            message: "คุณไม่ผ่านการทำเเบบทดสอบ",
            score: score
        })
    }

    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while calculating score."
        });


    }

}