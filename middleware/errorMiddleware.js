const errorHandler = (err, req, res, next) => {
    // developer needs err message in the console to debug the error
    logger.error(err);

    // If developer already defined error status → use it
    // Else → treat as server error (500)
    const statusCode = res.statusCode && res.statusCode !== 200? res.statusCode : 500;

    res.status(statusCode).json({
        message: err.message || "Server Error"
    });
};

module.exports = errorHandler;
