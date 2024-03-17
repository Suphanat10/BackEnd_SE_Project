const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.get_course_exam = async (req, res) => {
  try {
    const course_id = parseInt(req.params.course_id);

    if (!course_id) {
      return res.status(400).send({
        message: "Course ID is required!",
        code: 400,
      });
    }

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

    const courseExam = await prisma.course_exam.findMany({
      where: {
        course_id: course_id,
      },
    });
    res.status(200).send({ courseExam });
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
    console.log(exam_id);

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
    res.status(200).send({ examQuestion });
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

exports.create_exam_question = async (req, res) => {
  try {
    const exam_id = req.body.exam_id;
    const problem_name = req.body.problem_name;
    const correct_choice = req.body.correct_choice;

    if (!exam_id || !problem_name || !correct_choice) {
      return res.status(400).send({
        message: "Exam ID, problem name and correct choice are required!",
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

    const createQuestion = await prisma.course_exam_problem.create({
      data: {
        problem_name: problem_name,
        correct_choice: correct_choice,
        exam_id: exam_id,
      },
    });

    res.status(200).send({
      message: "Question was created successfully!",
      code: 200,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};

exports.create_exam_choices = async (req, res) => {
  try {
    const problem_id = req.body.problem_id;
    const label = req.body.label;

    if (!problem_id || !label) {
      return res.status(400).send({
        message: "Problem ID and label are required!",
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

    const createChoice = await prisma.course_exam_choices.create({
      data: {
        label: label,
        problem_id: problem_id,
      },
    });

    res.status(200).send({
      message: "Choice was created successfully!",
      code: 200,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};

exports.update_create_course_exam = async (req, res) => {
  try {
    const exam_id = req.body.exam_id;
    const exam_name = req.body.exam_name;

    if (!exam_id || !exam_name) {
      return res.status(400).send({
        message: "Exam ID and exam name are required!",
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

exports.update_create_exam_question = async (req, res) => {
  try {
    const problem_id = req.body.problem_id;
    const problem_name = req.body.problem_name;
    const correct_choice = req.body.correct_choice;

    if (!problem_id || !problem_name || !correct_choice) {
      return res.status(400).send({
        message: "Problem ID, problem name and correct choice are required!",
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

    const updateQuestion = await prisma.course_exam_problem.update({
      where: {
        problem_id: problem_id,
      },
      data: {
        problem_name: problem_name,
        correct_choice: correct_choice,
      },
    });

    res.status(200).send({
      message: "Question was updated successfully!",
      code: 200,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};

exports.update_create_exam_choices = async (req, res) => {
  try {
    const choices_id = req.body.choices_id;
    const label = req.body.label;

    if (!choices_id || !label) {
      return res.status(400).send({
        message: "Choice ID and label are required!",
        code: 400,
      });
    }

    const existingChoice = await prisma.course_exam_choices.findFirst({
      where: {
        choices_id: choices_id,
      },
    });

    if (!existingChoice) {
      return res.status(400).send({
        message: "Choice is not found!",
        code: 400,
      });
    }

    const updateChoice = await prisma.course_exam_choices.update({
      where: {
        choices_id: choices_id,
      },
      data: {
        label: label,
      },
    });

    res.status(200).send({
      message: "Choice was updated successfully!",
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


