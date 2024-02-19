const controller = require("../controllers/profile.controller");
const { authJwt } = require("../middleware");



module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


    app.post("/api/profile/updatePassword", 
    // [authJwt.verifyToken],
    controller.updatePassword);

    app.put("/api/profile/updateProfile",
    // [authJwt.verifyToken],
    controller.updateProfile);










};