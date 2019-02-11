var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Details = require("./app/models/pnl");
var MongoClient = require("mongodb").MongoClient;

// Configure app for bodyParser()
// lets us grab data from the body of POST
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

// Set up port for server to listen on
var port = process.env.PORT || 3002;

// Connect to DB
var url = "mongodb://localhost:27017/transaction";

MongoClient.connect(url, (err, db) => {
  const dbo = db.db("trans");
  //API Routes
  var router = express.Router();

  // Routes will all be prefixed with /API
  app.use("/api", router);

  //MIDDLE WARE-
  router.use(function(req, res, next) {
    console.log("FYI...There is some processing currently going down");
    next();
  });

  // test route
  router.get("/", function(req, res) {
    res.json({
      message: "Welcome !"
    });
  });

  router.route("/trans").post(function(req, res) {
    var casht = new Details();
    casht.toname = req.body.toname;
    casht.fromname = req.body.fromname;
    var sumc = 0;
    var sumd = 0;
    var flag = 0;
    dbo
      .collection("trail")
      .find({})
      .toArray(function(err, result) {
        if (err) throw err;
        for (i = 0; i < result.length; i++) {
          sumc = sumc + result[i].creditamount;
          sumd = sumd + result[i].debitamount;
        }
      });

    dbo
      .collection("pnl")
      .find({})
      .toArray(function(err, result) {
        for (i = 0; i < result.length; i++) {
          if (result[i].id == 1) {
            flag = 1;
          }
        }
      });
    if (flag == 1) {
      myalr = {
        id: 1
      };
      mynew = {
        id: 1,
        creditamount: sumc,
        debitamount: sumd
      };
      dbo.collection("pnl").updateOne(myalr, {
        $set: mynew
      });
    }
    if (flag == 0) {
      myobj = {
        id: 1,
        creditamount: sumc,
        debitamount: sumd
      };
      dbo.collection("pnl").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
      });
    }
    res.send("All things are set");
  });
});
