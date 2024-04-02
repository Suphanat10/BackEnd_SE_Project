const { PrismaClient } = require("@prisma/client");
const e = require("express");
const prisma = new PrismaClient();

exports.get_score = async (req, res) => {
  try {
    const registration_id = parseInt(req.params.registration_id);
//ค้นหาข้อมูล lesson  โดยค้นหาจาก registration_id ที่ได้รับ และรวมข้อมูลของ course, course_lesson, course_exam, course_exam_problem, course_exam_choices, และ reg_exam_ans ด้วย include.
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
    
    //กรองเลสันที่มีการสอบโดยใช้ filter โดยตรวจสอบว่ามี course_exam มากกว่า 0 
    let lesson_arr = find_lesson.course.course_lesson.filter((lesson) => {
      return lesson.course_exam.length > 0;
    });

    let pass = true;
//การคำนวณคะเเนน
    lesson_arr.map((lesson) => {
      lesson.course_exam.map((exam) => {
        //หาคำถามทั้งหมดว่ากี่ข้อ
        exam.total_problems = exam.course_exam_problem.length;

        exam.sum_Score = 0; //ตัวเเปรเก็บคะเเนน
        exam.is_do = false; //ตัวเเปรเช็คทำข้อสอบ

        exam.course_exam_problem.map((problem) => {
          //ตรวจสอบว่ามีข้อมูล reg_exam_ans ใน problem หรือไม่ ถ้ามีก็จะกำหนดค่า problem.reg_exam_ans ให้เป็นข้อมูลแรกในอาเรย์ problem.reg_exam_ans แต่ถ้าไม่มีข้อมูลก็จะกำหนดค่า problem.reg_exam_ans เป็น null
          problem.reg_exam_ans =
            problem.reg_exam_ans.length > 0 ? problem.reg_exam_ans[0] : null;

        //การตรวจสอบว่า problem.reg_exam_ans มีค่าไม่ใช่ null, undefined, หรือ false และ exam.is_do มีค่าเป็น false หรือไม่ ถ้าเงื่อนไขเป็นจริงจะกำหนดค่า exam.is_do เป็น true

          if (problem.reg_exam_ans && exam.is_do == false) {
            exam.is_do = true;
          }
//ตรวจสอบว่าผู้เรียนได้ทำการตอบคำถามในการสอบ (ในตัวแปร problem.reg_exam_ans) และคำตอบที่ผู้เรียนเลือก (problem.reg_exam_ans.select_choice) เท่ากับคำตอบที่ถูกต้อง (problem.correct_choice) ถ้าตรงกันทำการเพิ่มคะแนน (exam.sum_Score++) 
          if (
            problem.reg_exam_ans &&
            problem.reg_exam_ans.select_choice === problem.correct_choice
          ) {
            exam.sum_Score++;
          }
//ทำการลบ correct_choice ออกจาก  object 
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
      //ค้นหาข้อมูล lesson  โดยค้นหาจาก registration_id ที่ได้รับ และรวมข้อมูลของ course, course_lesson, course_exam, course_exam_problem, course_exam_choices, และ reg_exam_ans ด้วย include.
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
 //กรองเลสันที่มีการสอบโดยใช้ filter โดยตรวจสอบว่ามี course_exam มากกว่า 0 
      let lesson_arr = find_lesson.course.course_lesson.filter((lesson) => {
        return lesson.course_exam.length > 0;
      });

      lesson_arr.map((lesson) => {
        lesson.course_exam.map((exam) => {
               //หาคำถามทั้งหมดว่ากี่ข้อ
          exam.total_problems = exam.course_exam_problem.length;

          exam.sum_Score = 0;
          exam.is_do = false;

          exam.course_exam_problem.map((problem) => {
              //ตรวจสอบว่ามีข้อมูล reg_exam_ans ใน problem หรือไม่ ถ้ามีก็จะกำหนดค่า problem.reg_exam_ans ให้เป็นข้อมูลแรกในอาเรย์ problem.reg_exam_ans แต่ถ้าไม่มีข้อมูลก็จะกำหนดค่า problem.reg_exam_ans เป็น null
            problem.reg_exam_ans =
              problem.reg_exam_ans.length > 0 ? problem.reg_exam_ans[0] : null;

            //การตรวจสอบว่า problem.reg_exam_ans มีค่าไม่ใช่ null, undefined, หรือ false และ exam.is_do มีค่าเป็น false หรือไม่ ถ้าเงื่อนไขเป็นจริงจะกำหนดค่า exam.is_do เป็น true
            if (problem.reg_exam_ans && exam.is_do == false) {
              exam.is_do = true;
            }
//ตรวจสอบว่าผู้เรียนได้ทำการตอบคำถามในการสอบ (ในตัวแปร problem.reg_exam_ans) และคำตอบที่ผู้เรียนเลือก (problem.reg_exam_ans.select_choice) เท่ากับคำตอบที่ถูกต้อง (problem.correct_choice) ถ้าตรงกันทำการเพิ่มคะแนน (exam.sum_Score++)
            if (
              problem.reg_exam_ans &&
              problem.reg_exam_ans.select_choice === problem.correct_choice
            ) {
              exam.sum_Score++;
            }
//ทำการลบ correct_choice ออกจาก  object
            if (problem.correct_choice) {
              delete problem.correct_choice;
            }
          });
        });
      });

      for (const lesson of lesson_arr) {
        let sum_score = 0;  	//สร้างตัวแปร sum_score และ total_score ในแต่ละบทเรียน
        let total_score = 0;

        for (const exam of lesson.course_exam) {
          //ในแต่ละ exam, เพิ่มคะแนนที่ได้รับ (exam.sum_Score) ใน sum_score และเพิ่มจำนวนโจทย์ทั้งหมด (exam.total_problems) ใน total_score.
          sum_score += exam.sum_Score; 
          total_score += exam.total_problems;
        }
 //คำนวณคะแนนรวมของแต่ละบทเรียนในรูปแบบของเปอร์เซ็นต์ โดยการหารคะแนนรวมที่ได้รับ (sum_score) ด้วยจำนวนโจทย์ทั้งหมด (total_score) แล้วคูณด้วย 100 เพื่อแปลงให้อยู่ในรูปเปอร์เซ็นต์
        const score = (sum_score / total_score) * 100;

        //เช็คคะเนนถ้ามีคะใน exam ในบทใดน้อยกว่า 60 % จะ return 400
        if (score < 60) {
          res.status(400).send({
            message: "มีบทเรียนที่ยังไม่ผ่าน ไม่สามารถยืนยันการสำเร็จได้",
            code: 400,
          });
          return;
        }
      }

      //ถ้าไม่พบ exam ใดที่มีคะเเนนน้อยกว่า 60% ทำการ update  status =1

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





























