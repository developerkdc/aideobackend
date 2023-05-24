import Errorhandler from "../utils/errorHandler.js";

const error = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //Mongo Id Error
    if (err.name === "CastError") {
        const message = `Resource Not Found . Invalid:${err.path}`;
        err = new Errorhandler(message, 400);
    }

    //Mongo Duplicate Key Error
    if (err.code === 11000) {
        const message = `Duplicate :${Object.keys(err.keyValue)} Entered`;
        err = new Errorhandler(message, 400);
    }

    //Wrong JWT Token
    if (err.msg === "JsonWebTokenError") {
        const message = `Json Web Token is invalid`;
        err = new Errorhandler(message, 400);
    }

    //JWT expired Error
    if (err.msg === "TokenExpiredError") {
        const message = `Json Web Token is expired`;
        err = new Errorhandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err,
        description: err.message,
    });
};

export default error;
