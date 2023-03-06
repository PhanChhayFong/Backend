const { config } = require("dotenv");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

app.use(cors());
app.options("*", cors());

//middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use("/public/upload", express.static(__dirname + "/public/upload"));
app.use(errorHandler);

//Routes
const slidersRouter = require("./routers/sliders");
const productsRouter = require("./routers/products");
const categoriesRouter = require("./routers/categories");
const ordersRouter = require("./routers/orders");
const usersRouter = require("./routers/users");
const companyRouter = require("./routers/companies");
const shoppingcart = require("./routers/shoppingcarts");
const payment = require("./routers/paymentController");

const api = process.env.API_URL;

app.use(`${api}/sliders`, slidersRouter);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/companys`, companyRouter);
app.use(`${api}/shoppingcarts`, shoppingcart);
app.use(`${api}/payments`, payment);

//Database
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "A3Shop",
  })
  .then(() =>
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port: ${process.env.PORT}`)
    )
  )
  .catch((err) => console.log(err.message));
