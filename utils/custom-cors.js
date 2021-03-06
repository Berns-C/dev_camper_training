const corsSettings = (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Expose-Headers", "Content-Length");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,DELETE,POST,PUT");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin,Authorization,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method"
    );
    next();
}

module.exports = corsSettings;