require("dotenv").config();

// imports must come before use and app initialization
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan") ;
const logger = require("./utils/logger") ;

const app = express();   // create app before applying middleware

app.use(morgan("combined", {
  stream: {
    write: (message) => logger.info(message.trim()) 
  }
}));

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// JSON body --> req.body
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const notesRoutes = require("./routes/notesRoutes");

// apply security middleware
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100, // max 100 requests per IP per window
    message: {
        success: false,
        message: "too many requests. Try again later"
    }
});

// limit auth routes
app.use("/auth", limiter);

// To check whether the API is running or not
app.get("/", (req, res) => {
    res.json({ message: "API is running succesfully" });
});

// route mounting
// Any request starting with /auth will go to authRoutes file.
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);

const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

const PORT = process.env.PORT || 3000 ;

app.listen(PORT,() =>{
    logger.info(`Server running on port ${PORT}`) ;
}) ;
