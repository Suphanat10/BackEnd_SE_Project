const controller = require("../controllers/upimage.controller");
const { authJwt } = require("../middleware");
const express = require('express')
const multer  = require('multer')
const upload = require("../multer_controller/multer");


module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/img/upload/course",
 [authJwt.verifyToken],
  upload.single('file'),
  controller.uploadcourse);



    // app.post("/api/profile/updatePassword", 
    // // [authJwt.verifyToken],
    // controller.updatePassword);










};