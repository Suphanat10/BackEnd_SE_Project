const controller = require("../controllers/payment.controller");
const { authJwt } = require("../middleware");



module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/course/payment/submit_document", 
     [authJwt.verifyToken],
      authJwt.SaveLogs("ส่งหลักฐานการชำระเงิน"),
     controller.submit_document);

  app.post("/api/course/payment/approve",
      [authJwt.verifyToken],
      authJwt.SaveLogs("อนุมัติการชำระเงิน"),
      controller.approve);

  app.post("/api/course/payment/reject",
      [authJwt.verifyToken],
      authJwt.SaveLogs("ปฏิเสธการชำระเงิน"),
      controller.reject);



  
}