require("dotenv").config();
require("./startup/config")();
require("express-async-errors");
const dbService = require("./services/mongodb");

async function run() {
  dbService.getClient().connect();
  const app = require("express")();
  // server = await require("./startup/routes")(app);
  require("./startup/routes")(app);
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log("listening on port " + port));
}
run();
