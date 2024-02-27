
const controller = require("../controllers/course.controller");
const { authJwt } = require("../middleware");



module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/course/createCourse", 
     [authJwt.verifyToken, authJwt.isTutor],
     controller.create);


    app.post("/api/course/createLesson", 
    // [authJwt.verifyToken, authJwt.isTutor, authJwt.isAdmin],
    controller.course_lesson);

    app.post("/api/course/createContent",
    // [authJwt.verifyToken, authJwt.isTutor, authJwt.isAdmin],
     controller.course_lesson_content);

  app.get("/api/course/getCourse", controller.get_course);
  app.get("/api/course/getCourse/:id", controller.get_course_by_id);
  

  app.put("/api/course/updateCourse", 
  // [authJwt.verifyToken, authJwt.isTutor, authJwt.isAdmin],
  controller.update_course);

  app.put("/api/course/updateLesson",
  // [authJwt.verifyToken, authJwt.isTutor, authJwt.isAdmin],
   controller.update_lesson);

  app.put("/api/course/updateContent", 
  // [authJwt.verifyToken, authJwt.isTutor, authJwt.isAdmin],
  controller.update_content);



  app.delete("/api/course/delete/course_lesson/:id",
  // [authJwt.verifyToken, authJwt.isTutor, authJwt.isAdmin],
   controller.delete_course_lesson);


  app.delete("/api/course/delete/course_content/:id",
  // [authJwt.verifyToken, authJwt.isTutor, authJwt.isAdmin],
   controller.delete_content);


  app.post("/api/course/registerCourse",
  // [authJwt.verifyToken, authJwt.isStudent],
    controller.regis_course);




  app.get("/api/course/mycourse",
 [ authJwt.verifyToken],

    controller.get_mycourse);


};