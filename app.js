require("dotenv").config();
require("express-async-errors");
const express = require("express");

const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");
const connectDB = require("./db/connect");
const authMiddleware = require("./middleware/authentication");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// extra security  packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");

const rateLimiter = require("express-rate-limit");

const app = express();

// app.set("trust proxy", 1); use if you is behind a reverse proxy (Heroku, nginx, AWS ELB...)
app.use(
  rateLimiter({
    windowMsL: 15 * 60 * 1000, // 15mins
    max: 100, // limit each IP to 100 requests per windowMS
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());
// extra packages

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authMiddleware, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("connected to db...");
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
