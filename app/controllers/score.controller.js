const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.get_score = async (req, res) => {
  try {
    const registration_id = parseInt(req.params.registration_id);

    const find_lesson = await prisma.course_reg.findFirst({
      where: {
        registration_id: registration_id,
      },
      include: {
        course: {
          include: {
            course_lesson: {
              include: {
                course_exam: {
                  include: {
                    course_exam_problem: {
                      include: {
                        course_exam_choices: true,
                        reg_exam_ans: {
                          where: {
                            registration_id: registration_id,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    let lesson_arr = find_lesson.course.course_lesson.filter((lesson) => {
      return lesson.course_exam.length > 0;
    });

    lesson_arr.map((lesson) => {
      lesson.course_exam.map((exam) => {
        exam.total_problems = exam.course_exam_problem.length;

        exam.sum_Score = 0;
        exam.is_do = false;

        exam.course_exam_problem.map((problem) => {
          problem.reg_exam_ans =
            problem.reg_exam_ans.length > 0 ? problem.reg_exam_ans[0] : null;

          if (problem.reg_exam_ans && exam.is_do == false) {
            exam.is_do = true;
          }

          if (
            problem.reg_exam_ans &&
            problem.reg_exam_ans.select_choice === problem.correct_choice
          ) {
            exam.sum_Score++;
          }

          if (problem.correct_choice) {
            delete problem.correct_choice;
          }
        });
      });
    });

    res.status(200).send(lesson_arr);
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};

exports.completed = async (req, res) => {
  try{
   const registration_id  = req.body.registration_id;

  const update_status = await prisma.course_reg.update({
    where: {
      registration_id: registration_id,
    },
    data: {
      registration_status: 2,
    },
  });

  res.status(200).send({
    message: "Approved completion status",
    code: 200,
  });

}
catch (err) {
  res.status(500).send({
    message: err.message,
    code: 500,
  });
}
};





























