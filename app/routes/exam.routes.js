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


    app.post("/api/exam/createExam",
    // [authJwt.verifyToken, authJwt.isTutor],
    controller.create_course_exam);

    app.post("/api/exam/createQuestion",
    // [authJwt.verifyToken, authJwt.isTutor],

    controller.create_exam_question);

    app.post("/api/exam/createChoice",
    // [authJwt.verifyToken, authJwt.isTutor],
    controller.create_exam_choices);


    app.get("/api/exam/getExam/by_course/:course_id", controller.get_course_exam);
    app.get("/api/exam/getExam/:exam_id", controller.get_exam_question_choice_by_exam);

    







};