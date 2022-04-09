const express = require("express");
const path = require("path");
const hbs = require("hbs");
require("./db/mongoose");

const port = process.env.PORT || 3000;
const app = express();

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.static(static_path));

app.set("view engine", "hbs");
app.set("views", template_path);

hbs.registerPartials(partials_path);

const userRouter = require("./routers/user");

app.use(userRouter);

app.listen(port, () => {
  console.log(`The server has started on port ${port}`);
});
