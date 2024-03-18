const { PrismaClient } = require("@prisma/client");
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

exports.update__exam_question_choice = async (req, res) => {
  try{
    const  exam = req.body.exam;

    for await (const question of exam.questions) {
      const updateQuestion = await prisma.course_exam_problem.update({
        where: {
          problem_id: question.problem_id,
        },
        data: {
          problem_name: question.problem_name,
          correct_choice: question.correct_choice,
        },
      });

      const updateChoices = await prisma.course_exam_choices.updateMany({
        where: {
          problem_id: question.problem_id,
        },
        data: question.choices.map((choice) => {
          return {
            label: choice.label,
          };
        }),
      });

    }
    res.status(200).send({
      message: "Exam questions and choices updated successfully!",
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



exports.create_exam_question_choice = async (req, res) => {
  try {
    const exam = req.body.exam;
  
     const  removeExam = await prisma.course_exam_problem.deleteMany({
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







// exports.create_exam_question_choice = async (req, res) => {
//   try {
//     const exam = req.body.exam;

//     for await (const question of exam.questions) {
//       const createQuestion = await prisma.course_exam_problem.create({
//         data: {
//           problem_name: question.problem_name,
//           exam_id: exam.exam_id,
//           correct_choice: question.correct_choice,
//         },
//       });

//       const createChoices = await prisma.course_exam_choices.createMany({
//         data: question.choices.map((choice) => {
//           return {
//             problem_id: createQuestion.problem_id,
//             label: choice.label,
//           };
//         }),
//       });

//       const  choices_id =  await prisma.course_exam_choices.findMany({
//         where: {
//           problem_id: createQuestion.problem_id,
//         },
//       });


//       const choicesIds = createChoices.map((choice) => choice.choice_id);


//       const correctChoice = choicesIds.find((choiceId) => {
//         return choiceId === question.correct_choice;
//       }
//       );

//       if (!correctChoice) {
//         return res.status(400).send({
//           message: "Correct choice is not found!",
//           code: 400,
//         });
//       }

//       const updateQuestion = await prisma.course_exam_problem.update({
//         where: {
//           problem_id: createQuestion.problem_id,
//         },
//         data: {
//           correct_choice: correctChoice,
//         },
//       });




     
      


      


      
     








//     }
//     res.status(200).send({
//       message: "Exam questions and choices created successfully!",
//       code: 200,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       message: error.message,
//       code: 500,
//     });
//   }
// };

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
        course_exam_choices: {
          select: {
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
