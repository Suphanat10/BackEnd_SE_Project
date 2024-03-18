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

    const removeExam = await prisma.course_exam_problem.deleteMany({
      where: {
        exam_id: exam.exam_id,
      },
    });

    for await (const question of exam.questions) {
      const createQuestion = await prisma.course_exam_problem.create({
        data: {
          problem_name: question.problem_name,
          exam_id: exam.exam_id,
          correct_choice: null,
        },
      });

      await prisma.course_exam_choices.createMany({
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

      const choicesId = choiceIds.map((choice) => choice.choices_id);

      await prisma.course_exam_problem.update({
        where: {
          problem_id: createQuestion.problem_id,
        },
        data: {
          correct_choice: choicesId[question.correct_choice],
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

    // Fetch exams
    // const exams = await prisma.course_lesson.findMany({
    //   where: {
    //     course_id: course_id,
    //     course: {
    //       course_reg: {
    //         some: {
    //           user_id: user_id,
    //         },
    //       },
    //     },
    //   },
    //   select: {
    //     lesson_name: true,
    //     lesson_id: true,
    //     course_exam: {
    //       select: {
    //         exam_id: true,
    //         lesson_id: true,
    //         exam_name: true,
    //         course_exam_problem: {
    //           select: {
    //             problem_id: true,
    //             correct_choice: true,
    //             reg_exam_ans: {
    //               where: {
    //                 registration_id: registration_id,
    //               },
    //               select: {
    //                 select_choice: true,
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    // const examsWithProblemCounts = exams.map((course) => {
    //   const exams = course.course_exam.map((exam) => {
    //     const examProblems = exam.course_exam_problem.length;
    //     return {
    //       ...exam,
    //       total_problems: examProblems,
    //     };
    //   });
    //   return {
    //     ...course,
    //     course_exam: exams,
    //   };
    // });

    // const validExams = examsWithProblemCounts.filter(
    //   (item) => item.course_exam.length > 0
    // );

    // const totalScores = [];

    // for await (const exam of validExams) {
    //   let score = 0;
    //   for await (const problem of exam.course_exam) {
    //     for await (const ans of problem.course_exam_problem) {
    //       if (ans.reg_exam_ans.length > 0) {
    //         const correctChoice = ans.correct_choice;
    //         const selectChoice = ans.reg_exam_ans[0].select_choice;
    //         if (correctChoice === selectChoice) {
    //           score += 1;
    //         }
    //       }
    //     }
    //   }
    //   totalScores.push({

    //     exam_id: exam.course_exam[0].exam_id,
    //     score: score,
    //   });
    // }

    // for await (const exam of validExams) {
    //   for await (const problem of exam.course_exam) {
    //     delete problem.course_exam_problem;
    //   }
    // }

    // for await (const exam of validExams) {
    //   for await (const score of totalScores) {
    //     for await (const course_exam of exam.course_exam) {
    //       if (course_exam.exam_id === score.exam_id) {
    //         course_exam.score = score.score;
    //       }
    //     }
    //   }
    // }

    // res.status(200).send(validExams,);
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

    const reg_exam_ans = await prisma.reg_exam_ans.findMany({
      where: {
        registration_id: registration_id,
        course_exam_problem:{
          problem_id : examData.student_do_choice[0].problem_id
        }
      },
    });
    
     
    if (reg_exam_ans.length > 0) {
      const deleteAnswers = await prisma.reg_exam_ans.deleteMany({
        where: {
          registration_id: registration_id,
        },
      });
    }

    for await (const ans of examData.student_do_choice) {
      const createAnswer = await prisma.reg_exam_ans.create({
        data: {
          registration_id: registration_id,
          problem_id: ans.problem_id,
          select_choice: ans.select_choice,
        },
      });
    }

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
