const express = require("express");
const cors = require("cors");
const error = require("../middlewares/error");
const socketIo = require("socket.io");
const wsHandler = require("../ws_routes/handler.js");
const https = require("https");
const http = require("http");
const fs = require("fs").promises;
const path = require("path");
const cookieParser = require("cookie-parser");
module.exports = async function (app) {
  app.use(
    cors({
      credentials: true,
      origin: [
        "https://blackrainbow.liara.run",
        "https://www.blackrainbow.liara.run",
        "http://localhost:3001",
      ],
      withCredentials: true,
      // optionsSuccessStatus: 200,
    })
  );
  const server = http.createServer(app);
  // const io = socketIo(server, { cors: { credentials: true } });
  // wsHandler(io);
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const routes_strings = await fs.readdir(
    path.resolve(__dirname, "..", "routes")
  );
  for (let route of routes_strings)
    app.use(`/${route.split(".")[0]}`, require(`../routes/${route}`));

  app.use(error);

  return server;
};
