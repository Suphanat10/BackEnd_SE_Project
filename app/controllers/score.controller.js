const { PrismaClient } = require("@prisma/client");
const e = require("express");
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

    let pass = true;

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
  try {

    const registration_id = req.body.registration_id;

    if (!registration_id) {
      res.status(400).send({
        message: "registration_id is required",
        code: 400,
      });
      return;
    }

    //เช็คว่ามีการส่งคำตอบหรือยัง
    const check_answer = await prisma.reg_exam_ans.findFirst({
      where: {
        registration_id: registration_id,
      },
    });

    if (!check_answer) {
      res.status(400).send({
        message: "ยังไม่มีการส่งคำตอบไม่สามารถยืนยันการสำเร็จได้",
        code: 400,
      });
      return;
    } else {
      //ตรวจคะเเนน  เเยก exam_id ออกมา หาคะเเนนของเเเต่ละ exam ต้องมากกว่า 60 เปอร์เซ็น
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



      for (const lesson of lesson_arr) {
        let sum_score = 0;
        let total_score = 0;

        for (const exam of lesson.course_exam) {
          sum_score += exam.sum_Score;
          total_score += exam.total_problems;
        }

        const score = (sum_score / total_score) * 100;

        if (score < 60) {
          res.status(400).send({
            message: "มีบทเรียนที่ยังไม่ผ่าน ไม่สามารถยืนยันการสำเร็จได้",
            code: 400,
          });
          return;
        }
      }

      const update_status = await prisma.course_reg.update({
        where: {
          registration_id: registration_id,
        },
        data: {
          completion_status: 1,
        },
      });

      res.status(200).send({
        message: "Approved completion status",
        code: 200,
      });


    }

  }
  catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};





























