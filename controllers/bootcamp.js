const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');

//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   Public
/*
exports.getBootcamps = (req, res, next) => {
    Bootcamp.find().then(
        data => {
            res.status(200).json({
                success: true,
                data: data,
                count: data.length
            });
        }
    ).catch(err => {
        next(err);
    });
};
*/

exports.getBootcamps = async (req, res, next) => {
    try {
        const bootcampData = await Bootcamp.find();
        res.status(200).json({
            success: true,
            data: bootcampData,
            count: bootcampData.length
        });
    } catch (error) {
        next(error);
    }
};

//@desc     Get single bootcamps
//@route    GET /api/v1/bootcamps/:id
//@access   Public
exports.getBootcamp = (req, res, next) => {
    Bootcamp.findById(req.params.id).then(
        data => {
            //handles correct id format but doesn't exist.
            if (!data) {
                return new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404);
            }

            res.status(200).json({
                success: true,
                data: data
            });
        }
    ).catch(err => {
        next(err);
    });
};

//@desc     Create new bootcamps
//@route    POST /api/v1/bootcamps/
//@access   Private
exports.createBootcamp = (req, res, next) => {
    Bootcamp.create(req.body).then(data => {
        res.status(201).json({
            success: true,
            data: data
        });
    }).catch(err => {
        next(err);
    });
};

//@desc     Updates a bootcamps
//@route    PUT /api/v1/bootcamps/:id
//@access   Private
exports.updateBootcamp = (req, res, next) => {
    Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).then(data => {
        if (!data) {
            return new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404);
        }

        res.status(200).json({
            success: true,
            data: data
        });

    }).catch(err => {
        next(err);
    });
};

//@desc     Deletes a bootcamps
//@route    DELETE /api/v1/bootcamps/:id
//@access   Private
exports.deleteBootcamp = (req, res, next) => {
    Bootcamp.findByIdAndDelete(req.params.id).then(data => {
        if (!data) {
            return new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404);
        }

        res.status(200).json({
            success: true,
            message: 'Delete success'
        });

    }).catch(err => {
        next(err);
    });
};