const winston = require("winston");

const logger = winston.createLogger({
    // minimum level to log
    // anything below "info" (like debug) will be ignored in production
    level: "info",

    // format: timestamp + readable label + message
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),

    transports: [
        // transport 1: print to terminal
        new winston.transports.Console(),

        // transport 2: write all info+ logs to combined.log
        new winston.transports.File({ filename: "logs/combined.log" }),

        // transport 3: write only error logs to error.log
        new winston.transports.File({ filename: "logs/error.log", level: "error" })
    ]
});

module.exports = logger ;