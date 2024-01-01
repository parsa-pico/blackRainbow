const express = require("express");
const cors = require("cors");
const error = require("../middlewares/error");
const socketIo = require("socket.io");
const wsHandler = require("../ws_routes/handler.js");
const https = require("https");
const http = require("http");
const fs = require("fs").promises;
const path = require("path");
// const cookieParser = require("cookie-parser");
const customers = require("../routes/customers");
module.exports = function (app) {
  // const server = http.createServer(app);
  // app.use(async (req, res, next) => {
  //   console.log("hiii");
  //   res.set("Access-Control-Allow-Origin", process.env.FRONT_BASE_URL);
  //   res.set("Access-Control-Allow-Credentials", true);
  //   res.set("Vary", "Origin");
  //   res.set(
  //     "Access-Control-Allow-Headers",
  //     "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  //   );
  //   res.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  //   next();
  // });
  // const whitelist = [
  //   "https://blackrainbow.liara.run",
  //   "http://blackrainbow.liara.run",
  //   "blackrainbow.liara.run",
  //   "https://www.blackrainbow.liara.run",
  //   "http://localhost:3001",
  // ];
  // const corsOptions = {
  //   credentials: true,
  //   origin: function (origin, callback) {
  //     console.log("callback", callback);
  //     console.log("origin", origin);
  //     callback(null, true);
  //     // console.log("origin", origin);
  //     // if (whitelist.indexOf(origin) !== -1) {
  //     //   callback(null, true);
  //     // } else {
  //     //   callback(new Error("Not allowed by CORS"));
  //     // }
  //   },

  //   optionsSuccessStatus: 200,
  // };
  // console.log("cors-", cors);
  // console.log("cors", cors());
  // console.log("cookieParser-", cookieParser);
  // console.log("cookieParser", cookieParser());
  // console.log("corsOptions", corsOptions);
  // app.options("*", cors(corsOptions));
  app.use(
    cors({ origin: "https://blackrainbow.liara.run/", credentials: true })
  );
  // app.use(function (req, res, next) {
  //   res.header("Access-Control-Allow-Origin", "https://blackrainbow.liara.run");
  //   res.header("Access-Control-Allow-Credentials", true);
  //   res.header(
  //     "Access-Control-Allow-Headers",
  //     "Origin, X-Requested-With, Content-Type, Accept"
  //   );
  //   next();
  // });
  // app.use((req, res, next) => {
  //   console.log("before cors");
  //   cors(corsOptions)(req, res, next);
  //   console.log("after cors");
  // });

  // const io = socketIo(server, { cors: { credentials: true } });
  // wsHandler(io);

  // app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/customers", customers);
  // const routes_strings = await fs.readdir(
  //   path.resolve(__dirname, "..", "routes")
  // );
  // for (let route of routes_strings)
  //   app.use(`/${route.split(".")[0]}`, require(`../routes/${route}`));

  app.use(error);

  // return server;
};
