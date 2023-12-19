const express = require("express");
const cors = require("cors");
const error = require("../middlewares/error");
// const admin = require("../routes/admin.js");
// const customers = require("../routes/customers.js");
// const items = require("../routes/items.js");
// const carts = require("../routes/carts.js");
const socketIo = require("socket.io");
const wsHandler = require("../ws_routes/handler.js");
const https = require("https");
const http = require("http");
const fs = require("fs");
routes_strings = ["customers", "items", "carts", "options"];
module.exports = function (app) {
  app.use(cors());
  const server = http.createServer(app);
  const io = socketIo(server, { cors: { credentials: true } });
  wsHandler(io);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // app.use("/admin", admin);
  // app.use("/customer", customers);
  // app.use("/items", items);
  // app.use("/carts", carts);
  // app.use("/options", options);
  app.use(error);
  return server;
};
