const { PrismaClient } = require("@prisma/client");
const e = require("express");
const prisma = new PrismaClient();

exports.get_course_exam = async (req, res) => {
  try {
    const lesson_id = parseInt(req.params.lesson_id);
    const user_id = req.user_id;

    if (!lesson_id) {
      return res.status(400).send({
        message: "Lesson ID is required!",
        code: 400,
      });
    }
    const exam = await prisma.course_exam.findMany({
      where: {
        lesson_id: lesson_id,
        course: {
          instructor: user_id,
        },
      },
      include: {
        _count: {
          select: {
            course_exam_problem: true,
          },
        },
      },
    });

    res.status(200).send(exam);
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};



exports.create_exam_question_choice = async (req, res) => {
  try {
    const exam = req.body.exam;

    const Exam = await prisma.course_exam_problem.findMany({
      where: {
        exam_id: exam.exam_id,
      },
    });

    console.log(Exam);
    console.log(Exam.problem_id);

    if (Exam.length > 0) {
      for await (const question of exam.questions) {
        await prisma.course_exam_problem.updateMany({
          where: {
            problem_id: question.problem_id,
          },
          data: {
            problem_name: question.problem_name,
            correct_choice: null,
          },
        });

    

        await Promise.all(
          question.choices.map(async (choice) => {
            await prisma.course_exam_choices.updateMany({
              where: {
                problem_id: question.problem_id,
              },
              data: {
                label: choice.label,
              },
            });
          })
        );

        const choiceIds = await prisma.course_exam_choices.findMany({
          where: {
            problem_id: question.problem_id,
          },
          select: {
            choices_id: true,
          },
        });

        const choiceIdsArray = choiceIds.map((choice) => choice.choices_id);

        await prisma.course_exam_problem.update({
          where: {
            problem_id: question.problem_id,
          },
          data: {
            correct_choice: choiceIdsArray[question.correct_choice],
          },
        });
      }

      return res.status(200).send({
        message: "Exam questions and choices created successfully!",
        code: 200,
      });
    }

    for await (const question of exam.questions) {
      const createQuestion = await prisma.course_exam_problem.create({
        data: {
          problem_name: question.problem_name,
          exam_id: exam.exam_id,
          correct_choice: null,
        },
      });

      const createChoices = await prisma.course_exam_choices.createMany({
        data: question.choices.map((choice) => {
          return {
            problem_id: createQuestion.problem_id,
            label: choice.label,
          };
        }),
      });

      const choiceIds = await prisma.course_exam_choices.findMany({
        where: {
          problem_id: createQuestion.problem_id,
        },
        select: {
          choices_id: true,
        },
      });

      const choiceIdsArray = choiceIds.map((choice) => choice.choices_id);

      await prisma.course_exam_problem.update({
        where: {
          problem_id: createQuestion.problem_id,
        },
        data: {
          correct_choice: choiceIdsArray[question.correct_choice],
        },
      });
    }

    res.status(200).send({
      message: "Exam questions and choices created successfully!",
      code: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: error.message,
      code: 500,
    });
  }
};

exports.update_exam = async (req, res) => {
  try {
    const exam_id = parseInt(req.body.exam_id);
    const exam_name = req.body.exam_name;

    const existingExam = await prisma.course_exam.findFirst({
      where: {
        exam_id: exam_id,
      },
    });

    if (!existingExam) {
      return res.status(404).send({
        message: "Exam is not found!",
        code: 404,
      });
    }

    const updateExam = await prisma.course_exam.update({
      where: {
        exam_id: exam_id,
      },
      data: {
        exam_name: exam_name,
      },
    });

    res.status(200).send({
      message: "Exam was updated successfully!",
      code: 200,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};

exports.get_exam_question_choice_by_exam = async (req, res) => {
  try {
    const exam_id = parseInt(req.params.exam_id);

    if (!exam_id) {
      return res.status(400).send({
        message: "Exam ID is required!",
        code: 400,
      });
    }

    const existingExam = await prisma.course_exam.findFirst({
      where: {
        exam_id: exam_id,
      },
    });

    if (!existingExam) {
      return res.status(404).send({
        message: "Exam is not found!",
        code: 404,
      });
    }
    const examQuestion = await prisma.course_exam_problem.findMany({
      select: {
        problem_id: true,
        problem_name: true,
        correct_choice: true,
        course_exam_choices: {
          select: {
            choices_id: true,
            label: true,
          },
        },
      },
      where: {
        exam_id: exam_id,
      },
    });

    if (!examQuestion) {
      return res.status(200).send([]);
    }

    res.status(200).send(examQuestion);
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};

exports.create_course_exam = async (req, res) => {
  try {
    const course_id = req.body.course_id;
    const exam_name = req.body.exam_name;
    const lesson_id = req.body.lesson_id;

    const existingCourse = await prisma.course.findFirst({
      where: {
        course_id: course_id,
      },
    });

    if (!existingCourse) {
      return res.status(404).send({
        message: "Course is not found!",
        code: 404,
      });
    }

    const existingExam = await prisma.course_exam.findFirst({
      where: {
        exam_name: exam_name,
      },
    });

    if (existingExam) {
      return res.status(403).send({
        message: "Exam with the same name already exists!",
        code: 403,
      });
    }

    const createExam = await prisma.course_exam.create({
      data: {
        exam_name: exam_name,
        course_id: course_id,
        lesson_id: lesson_id,
      },
    });

    res.status(200).send({
      message: "Exam was created successfully!",
      code: 200,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};

exports.delete_exam = async (req, res) => {
  try {
    const exam_id = parseInt(req.params.exam_id);

    if (!exam_id) {
      return res.status(400).send({
        message: "Exam ID is required!",
        code: 400,
      });
    }

    const existingExam = await prisma.course_exam.findFirst({
      where: {
        exam_id: exam_id,
      },
    });

    if (!existingExam) {
      return res.status(404).send({
        message: "Exam is not found!",
        code: 404,
      });
    }

    const deleteExam = await prisma.course_exam.delete({
      where: {
        exam_id: exam_id,
      },
    });

    res.status(200).send({
      message: "Exam was deleted successfully!",
      code: 200,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};

exports.delete_exam_question = async (req, res) => {
  try {
    const problem_id = parseInt(req.params.problem_id);

    if (!problem_id) {
      return res.status(400).send({
        message: "Problem ID is required!",
        code: 400,
      });
    }

    const existingProblem = await prisma.course_exam_problem.findFirst({
      where: {
        problem_id: problem_id,
      },
    });

    if (!existingProblem) {
      return res.status(404).send({
        message: "Problem is not found!",
        code: 404,
      });
    }

    const deleteProblem = await prisma.course_exam_problem.delete({
      where: {
        problem_id: problem_id,
      },
    });

    res.status(200).send({
      message: "Problem was deleted successfully!",
      code: 200,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};

exports.delete_exam_choices = async (req, res) => {
  try {
    const choices_id = parseInt(req.params.choices_id);

    if (!choices_id) {
      return res.status(400).send({
        message: "Choice ID is required!",
        code: 400,
      });
    }

    const existingChoice = await prisma.course_exam_choices.findFirst({
      where: {
        choices_id: choices_id,
      },
    });

    if (!existingChoice) {
      return res.status(404).send({
        message: "Choice is not found!",
        code: 404,
      });
    }

    const deleteChoice = await prisma.course_exam_choices.delete({
      where: {
        choices_id: choices_id,
      },
    });

    res.status(200).send({
      message: "Choice was deleted successfully!",
      code: 200,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};

exports.get_exm_sut = async (req, res) => {
  try {
    const exam_id = parseInt(req.params.exam_id);
    const user_id = req.user_id;

    const exam = await prisma.course_exam.findFirst({
      where: {
        exam_id: exam_id,
        course: {
          course_reg: {
            some: {
              user_id: user_id,
            },
          },
        },
      },
      include: {
        course_exam_problem: {
          select: {
            problem_name: true,
            problem_id: true,
            course_exam_choices: true,
          },
        },
      },
    });

    if (!exam) {
      return res.status(200).send([]);
    }

    res.status(200).send(exam);
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};

exports.get_exam = async (req, res) => {
  try {
    const course_id = parseInt(req.params.course_id);
    const user_id = req.user_id;

    // Find registration_id
    const registration = await prisma.course_reg.findFirst({
      where: {
        user_id: user_id,
        course_id: course_id,
      },
    });

    if (!registration) {
      return res.status(404).send({
        message: "User is not registered for this course!",
        code: 404,
      });
    }

    const registration_id = registration.registration_id;

    const find_lesson = await prisma.course_lesson.findMany({
      where: {
        course_id: course_id,
      },
      include: {
        course_exam: {
          include: {
            course_exam_problem: {
              include: {
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
    });

    let lesson_arr = find_lesson.filter((lesson) => {
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

exports.do_Exam = async (req, res) => {
  try {
    const examData = req.body.exam;
    const user_id = req.user_id;

    const registration = await prisma.course_reg.findFirst({
      where: {
        user_id: req.user_id,
        course_id: examData.course_id,
      },
    });
    const registration_id = registration.registration_id;

    // Delete All reg_exam_ans
    await prisma.reg_exam_ans.deleteMany({
      where: {
        registration_id: registration_id,
        problem_id: {
          in: examData.student_do_choice.map((item) => item.problem_id),
        },
      },
    });

    // Create
    await prisma.reg_exam_ans.createMany({
      data: examData.student_do_choice.map((item) => {
        return {
          registration_id: registration_id,
          problem_id: item.problem_id,
          select_choice: item.select_choice,
        };
      }),
    });

    res.status(200).send({
      message: "Exam was submitted successfully!",
      code: 200,
      registration_id: registration_id,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      code: 500,
    });
  }
};
