const controller = require("../controllers/exam.controller");
const { authJwt } = require("../middleware");



module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


    app.post("/api/course/exam/createExam",
    [authJwt.verifyToken,],
    authJwt.SaveLogs("สร้างชื่อเเบบทดสอบ"),
    
    controller.create_course_exam);


    app.get("/api/course/getExam/:lesson_id", 
    [authJwt.verifyToken,],
    controller.get_course_exam);


    app.get("/api/course/exam/getExam/question/:exam_id", 
    [authJwt.verifyToken,],
    controller.get_exam_question_choice_by_exam);


    app.delete("/api/course/exam/deleteExam/:exam_id",
    [authJwt.verifyToken,],
    authJwt.SaveLogs("ลบขชื่อเเบบทดสอบ"),
    controller.delete_exam);


app.post("/api/course/exam/updateExam",
[authJwt.verifyToken,],
authJwt.SaveLogs("เเก้ไขชื่อเเบบทดสอบ"),
 controller.update_exam);


    app.post("/api/course/createQuestion",
    [authJwt.verifyToken,],
    authJwt.SaveLogs("สร้างคำถามเเละคำตอบ"),
    controller.create_exam_question_choice);





    







};