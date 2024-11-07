const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
// const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const sseRouter = require("./routes/sseRoute");
const AppError = require('./utils/AppError')
const ticketRouter = require("./routes/ticketRoute");
const employeeRouter = require("./routes/employeeRoute");
const departmentRouter = require("./routes/departmentRoute");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.enable("trust-proxy");
const corsOptions = {
  origin: 'http://localhost:3000',  // explicitly specify your frontend URL
  credentials: true,                // allow credentials (cookies) in requests
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use("/user_ticket", express.static(path.join(__dirname, "user_ticket")));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});


app.use("/api/v1/employees/login", limiter);

app.use("/api/v1/employees/signUp", limiter);

app.use(express.json({ limit: "16mb" })); //limits the size of the body to 16mb

app.use(compression());


app.options('http://localhost:3000', cors(corsOptions));  // handle all OPTIONS requests

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/tickets", ticketRouter);
app.use("/api/v1/employees", employeeRouter);
app.use("/api/v1/departments", departmentRouter);

app.use("/api/v1/sse", sseRouter);


app.all('*' , (req , res ,next)=>{
  next(new AppError( `Can't find ${req.originalUrl} on this server!`, 404))
})




app.use(globalErrorHandler);
module.exports = app;
