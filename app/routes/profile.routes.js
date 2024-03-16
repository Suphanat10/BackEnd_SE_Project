const controller = require("../controllers/profile.controller");
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


  app.get("/api/profile/getProfile",
    [authJwt.verifyToken],
    controller.getProfile);


    app.post("/api/profile/updatePassword", 
    [authJwt.verifyToken],
    controller.updatePassword);

    app.post("/api/profile/updateProfile",
    [authJwt.verifyToken],
    controller.updateProfile);

    app.get("/api/profile/get_img",
    [authJwt.verifyToken],
    controller.get_img);

    app.post("/api/profile/upload_img",
    [authJwt.verifyToken],
    upload.single('file'),
    controller.upuploadImage);













};