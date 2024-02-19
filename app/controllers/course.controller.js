const { PrismaClient } = require('@prisma/client');
const e = require('express');
const prisma = new PrismaClient();

exports.create = async (req, res) => {
    try {
        const { course_name, course_description, course_visibility,  instructor } = req.body;
        
        if(!course_name || !course_description || !course_visibility || !instructor){
            return res.status(400).send({
                message: "Please fill all the fields!",
                code: 400
            });
        }
        

        const existingCourse = await prisma.course.findFirst({
            where: {
                course_name: course_name
            }
        });

        if (existingCourse) {
            return res.status(403).send({
                message: "Course with the same name already exists!",
                code: 403
            });
        }
    
        const createCourse = await prisma.course.create({
            data: {
                course_name: course_name,
                course_description: course_description,
                course_visibility: course_visibility,
                instructor: instructor,
            }

        });

        res.status(200).send({
            message: "Course was created successfully!",
            code: 200
        });

    } catch (err) {
        res.status(500).send({
            message: err.message,
            code: 500
        });
    }
};

exports.course_lesson = async (req, res) => {
    try {
        const lesson_name = req.body.lesson_name;
        const course_id = req.body.course_id;

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
        const createLesson = await prisma.course_lesson.create({
            data: {
                lesson_name: lesson_name,
                course_id: course_id
            }
        });

        res.status(200).send({
            message: "Lesson was created successfully!",
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

exports.course_lesson_content = async (req, res) => {
    try {
        const lesson_id = req.body.lesson_id;
        const content_data = req.body.content_data;
        const content_type = req.body.content_type;

        const existingLesson = await prisma.course_lesson.findFirst({
            where: {
                lesson_id: lesson_id
            }
        });
        if (!existingLesson) {
            return res.status(400).send({
                message: "Lesson is not found!",
                code: 400
            });
        }
        const createContent = await prisma.lesson_chapter.create({
            data: {
                lesson_id: lesson_id,
                content_data: content_data,
                content_type: content_type
            }
        });

        res.status(200).send({
            message: "Content was created successfully!",
            code: 200
        });
    } catch (err) {
        res.status(500).send({
            message: err.message,
            code: 500
        });
    }
}

exports.get_course = async (req, res) => {
    try {
        const course = await prisma.course.findMany({
            select: {
                course_id: true,
                course_name: true,
                course_description: true,
                course_visibility: true,
                course_lesson: {
                    select: {
                        lesson_name : true,
                        lesson_id : true,
                    }
                }
            }
        });
        
        if(!course){
            return res.status(400).send({
                message: "Course is not found!",
                code: 400
            });
        }

        res.status(200).send(course);
    }
    catch (err) {
        res.status(500).send({
            message: err.message,
            code: 500
        });
    }
}

exports.update_course = async (req, res) => {
    try{
          const course_id = req.body.course_id;
            const course_name = req.body.course_name;
            const course_description = req.body.course_description;
            const course_visibility = req.body.course_visibility;


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

            const updateCourse = await prisma.course.update({
                where: {
                    course_id: course_id
                },
                data: {
                    course_name: course_name,
                    course_description: course_description,
                    course_visibility: course_visibility,
                }
            });

            res.status(200).send({
                message: "Course was updated successfully!",
                code: 200
            });
    } catch (err) {
        res.status(500).send({
            message: err.message,
            code: 500
        });
    }   
}

exports.update_lesson = async (req, res) => {
    try{
        const lesson_id = req.body.lesson_id;
        const lesson_name = req.body.lesson_name;

        const existingLesson = await prisma.course_lesson.findFirst({
            where: {
                lesson_id: lesson_id
            }
        });

        if (!existingLesson) {
            return res.status(400).send({
                message: "Lesson is not found!",
                code: 400
            });
        }

        const updateLesson = await prisma.course_lesson.update({
            where: {
                lesson_id: lesson_id
            },
            data: {
                lesson_name: lesson_name,
            }
        });

        res.status(200).send({
            message: "Lesson was updated successfully!",
            code: 200
        });

    } catch (err) {
        res.status(500).send({
            message: err.message,
            code: 500
        });
    }
}

exports.update_content = async (req, res) => {
    try{
        const lesson_chapter_id = req.body.lesson_chapter_id;
        const content_data = req.body.content_data;
        const content_type = req.body.content_type;

        const existingContent = await prisma.lesson_chapter.findFirst({
            where: {
                lesson_chapter_id: lesson_chapter_id
            }
        });

        if (!existingContent) {
            return res.status(400).send({
                message: "Content is not found!",
                code: 400
            });
        }

        const updateContent = await prisma.lesson_chapter.update({
            where: {
                lesson_chapter_id: lesson_chapter_id
            },
            data: {
                content_data: content_data,
                content_type: content_type
            }
        });

        res.status(200).send({
            message: "Content was updated successfully!",
            code: 200
        });

    } catch (err) {
        res.status(500).send({
            message: err.message,
            code: 500
        });
    }
}


exports.delete_course_lesson  = async (req, res) => {
    try{

        const lesson_id = parseInt(req.params.id); 


const existingLesson = await prisma.course_lesson.findFirst({
    where: {
        lesson_id: lesson_id 
    }
});

  
    if (!existingLesson) {
        return res.status(400).send({
            message: "Lesson is not found!",
            code: 400
        });
    }

    const deleteLesson = await prisma.course_lesson.delete({
        where: {
            lesson_id: lesson_id
        }
    });

    res.status(200).send({
        message: "Lesson was deleted successfully!",
        code: 200
    });
} catch (err) {
    res.status(500).send({
        message: err.message,
        code: 500
    });
}
}



exports.delete_content  = async (req, res) => {
    try{

        const lesson_chapter_id = parseInt(req.params.id);

        const existingContent = await prisma.lesson_chapter.findFirst({
            where: {
                lesson_chapter_id: lesson_chapter_id
            }
        });

        if (!existingContent) {
            return res.status(400).send({
                message: "Content is not found!",
                code: 400
            });
        }
        const deleteContent = await prisma.lesson_chapter.delete({
            where: {
                lesson_chapter_id: lesson_chapter_id
            }
        });

        res.status(200).send({
            message: "Content was deleted successfully!",
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


exports.get_course_by_id = async (req, res) => {
    try {
        const course_id = parseInt(req.params.id);

        const course = await prisma.course.findFirst({
            where: {
                course_id: course_id
            },
            select: {
                course_id: true,
                course_name: true,
                course_description: true,
                course_visibility: true,
                course_lesson: {
                    select: {
                        lesson_name : true,
                        lesson_id : true,
                    }
                }
            }
        });
        
        if(!course){
            return res.status(400).send({
                message: "Course is not found!",
                code: 400
            });
        }

        res.status(200).send(course);
    }
    catch (err) {
        res.status(500).send({
            message: err.message,
            code: 500
        });
    }
}

exports.get_course_by_id = async (req, res) => {
    try {
        const course_id = parseInt(req.params.id);

        const course = await prisma.course.findFirst({
            where: {
                course_id: course_id
            },
            select: {
                course_id: true,
                course_name: true,
                course_description: true,
                course_visibility: true,
                course_lesson: {
                    select: {
                        lesson_name : true,
                        lesson_id : true,
                    }
                }
            }
        });
        
        if(!course){
            return res.status(400).send({
                message: "Course is not found!",
                code: 400
            });
        }

        res.status(200).send(course);
    }
    catch (err) {
        res.status(500).send({
            message: err.message,
            code: 500
        });
    }
}



   
