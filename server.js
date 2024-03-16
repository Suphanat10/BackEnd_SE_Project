const express = require("express");
const cors = require("cors");
const app = express();


const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type" );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
}
);



app.use("/api/public",express.static('./app/image/courseimage'));
app.use("/api/profile/img",express.static('./app/image/profile'));


require("./app/routes/auth.routes")(app);
require("./app/routes/course.routes")(app);
require("./app/routes/exam.routes")(app);
require("./app/routes/profile.routes")(app);
require("./app/routes/users.routes")(app);
require("./app/routes/score.routes")(app);
require("./app/routes/payment.routes")(app);
require("./app/routes/upimage.routes")(app);


