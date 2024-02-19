const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.create_course_exam = async (req, res) => {
    try{
        const course_id = req.body.course_id;
        const exam_name = req.body.exam_name;

        const existingCourse = await prisma.course.findFirst({
            where: {
                course_id: course_id
            }
        });

        if (!existingCourse) {
            return res.status(400).send({
                message: "Course is not found!",
                code: 400
            });
        }

        const existingExam = await prisma.course_exam.findFirst({
            where: {
                exam_name: exam_name
            }
        });

        if (existingExam) {
            return res.status(400).send({
                message: "Exam with the same name already exists!",
                code: 400
            });
        }

        const createExam = await prisma.course_exam.create({
            data: {
                exam_name: exam_name,
                course_id: course_id
            }
        });

        res.status(200).send({
            message: "Exam was created successfully!",
            code: 200
        });

    }
    catch (err) {
        res.status(500).send({
            message: err.message,
            code: 500
        });
    }
}

exports.create_exam_question = async (req, res) => {
      try {
        const exam_id = req.body.exam_id;
        const  problem_name = req.body.problem_name;
        const correct_choice = req.body.correct_choice;

        if(!exam_id || !problem_name || !correct_choice){
            return res.status(400).send({
                message: "Exam ID, problem name and correct choice are required!",
                code: 400
            });
        }
    
        const existingExam = await prisma.course_exam.findFirst({
            where: {
                exam_id: exam_id
            }
        });

        if (!existingExam) {
            return res.status(400).send({
                message: "Exam is not found!",
                code: 400
            });
        }

        const createQuestion = await prisma.course_exam_problem.create({
            data: {
                problem_name: problem_name,
                correct_choice: correct_choice,
                exam_id: exam_id
            }
        });

        res.status(200).send({
            message: "Question was created successfully!",
            code: 200
        });

    }
    catch (err) {
        res.status(500).send({
            message: err.message,
            code: 500
        });
    }
}


exports.update_create_course_exam = async (req, res) => {
    try {
        const exam_id = req.body.exam_id;
        const exam_name = req.body.exam_name;

        if(!exam_id || !exam_name){
            return res.status(400).send({
                message: "Exam ID and exam name are required!",
                code: 400
            });
        }

        const existingExam = await prisma.course_exam.findFirst({
            where: {
                exam_id: exam_id
            }
        });

        if (!existingExam) {
            return res.status(400).send({
                message: "Exam is not found!",
                code: 400
            });
        }

        const updateExam = await prisma.course_exam.update({
            where: {
                exam_id: exam_id
            },
            data: {
                exam_name: exam_name
            }
        });

        res.status(200).send({
            message: "Exam was updated successfully!",
            code: 200
        });

    }
    catch (err) {
        res.status(500).send({
            message: err.message,
            code: 500
        });
    }
}

exports.update_create_exam_question = async (req, res) => {
    try {
        const problem_id = req.body.problem_id;
        const problem_name = req.body.problem_name;
        const correct_choice = req.body.correct_choice;

        if(!problem_id || !problem_name || !correct_choice){
            return res.status(400).send({
                message: "Problem ID, problem name and correct choice are required!",
                code: 400
            });
        }

        const existingProblem = await prisma.course_exam_problem.findFirst({
            where: {
                problem_id: problem_id
            }
        });

        if (!existingProblem) {
            return res.status(400).send({
                message: "Problem is not found!",
                code: 400
            });
        }

        const updateQuestion = await prisma.course_exam_problem.update({
            where: {
                problem_id: problem_id
            },
            data: {
                problem_name: problem_name,
                correct_choice: correct_choice
            }
        });

        res.status(200).send({
            message: "Question was updated successfully!",
            code: 200
        });

    }
    catch (err) {
        res.status(500).send({
            message: err.message,
            code: 500
        });
    }
}















