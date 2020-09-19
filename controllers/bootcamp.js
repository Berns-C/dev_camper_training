//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   Public
exports.getBootcamps = (req, res, next) => {
    res.status(200).json({
        sucess: true,
        data: { msg: 'Show all bootcamps' }
    });
    next();
};

//@desc     Get single bootcamps
//@route    GET /api/v1/bootcamps/:id
//@access   Public
exports.getBootcamp = (req, res, next) => {
    res.status(200).json({
        sucess: true,
        data: { msg: `Show bootcamps ${req.params.id}` }
    });
    next();
};

//@desc     Create new bootcamps
//@route    POST /api/v1/bootcamps/:id
//@access   Private
exports.createBootcamp = (req, res, next) => {
    res.status(200).json({
        sucess: true,
        data: { msg: `Create new bootcamp` }
    });
    next();
};

//@desc     Updates a bootcamps
//@route    PUT /api/v1/bootcamps/:id
//@access   Private
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({
        sucess: true,
        data: { msg: `Update bootcamp ${req.params.id}` }
    });
};

//@desc     Deletes a bootcamps
//@route    DELETE /api/v1/bootcamps/:id
//@access   Private
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({
        sucess: true,
        data: { msg: `Delete bootcamp ${req.params.id}` }
    });
};