const path = require('path');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../custom_middleware/async');

//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

//@desc     Get single bootcamps
//@route    GET /api/v1/bootcamps/:id
//@access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcampData = await Bootcamp.findById(req.params.id);

    if (!bootcampData) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with ID of ${req.params.id}`,
                404
            )
        );
    }

    res.status(200).json({
        success: true,
        data: bootcampData
    });
});

//@desc     Create new bootcamps
//@route    POST /api/v1/bootcamps/
//@access   Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;

    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    // If the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `The user with ID ${req.user.id} has already published a bootcamp`,
                400
            )
        );
    }

    const bootcampData = await Bootcamp.create(req.body);

    res.status(201).json({
        success: true,
        data: bootcampData
    });
});

exports.retrieveUserPublishedBootcamp = asyncHandler(async (req,res,next) => {
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
    console.log('retrieveUserPublishedBootcamp ', publishedBootcamp);
    if (!publishedBootcamp) {
        return next(
            new ErrorResponse(
                `The user with ID ${req.user.id} has no published bootcamp.`,
                400
            )
        );
    }

    res.status(200).json({
        success: true,
        data: publishedBootcamp
    });

});

//@desc     Updates a bootcamps
//@route    PUT /api/v1/bootcamps/:id
//@access   Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcampData = await Bootcamp.findById(req.params.id);

    if (!bootcampData) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with ID of ${req.params.id}`,
                404
            )
        );
    }

    // Make sure user is bootcamp owner
    if(bootcampData.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorized to update this bootcamp.`,
                401
            )
        );
    }

    bootcampData = await Bootcamp.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        success: true,
        data: bootcampData
    });
});

//@desc     Deletes a bootcamps
//@route    DELETE /api/v1/bootcamps/:id
//@access   Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    // Note findByIdAndDelete will not trigger cascade delete in Bootcamp schema.
    // Replace findByIdAndDelete with findById'
    //const bootcampData = await Bootcamp.findByIdAndDelete(req.params.id);
    const bootcampData = await Bootcamp.findById(req.params.id);

    // Make sure user is bootcamp owner
    if(bootcampData.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorized to delete this bootcamp.`,
                401
            )
        );
    }

    // Trigger the cascade delete middleware in Bootcamp Schema'
    bootcampData.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

//@desc     Get bootcamps within a radius
//@route    Get /api/v1/bootcamps/radius/:zipcode/:distance
//@access   Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    //Get latitude and longtitude from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lang = loc[0].longitude;

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: { $centerSphere: [ [ lang, lat ], radius ] }
        }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});


//@desc     Upload a photo for bootcamps
//@route    PUT /api/v1/bootcamps/:id/photo
//@access   Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    // Note findByIdAndDelete will not trigger cascade delete in Bootcamp schema.
    // Replace findByIdAndDelete with findById'
    //const bootcampData = await Bootcamp.findByIdAndDelete(req.params.id);
    const bootcampData = await Bootcamp.findById(req.params.id);

    if (!bootcampData) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with ID of ${req.params.id}`,
                404
            )
        );
    }

    // Make sure user is bootcamp owner
    if(bootcampData.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorized to update this bootcamp.`,
                401
            )
        );
    }

    if (!req.files) {
        return next(
            new ErrorResponse(
                `Please upload a file`,
                400
            )
        );
    }

    console.log(req.files.file)
    const file = req.files.file;
    // Check if file is image.
    if (!file.mimetype.startsWith('image')) {
        return next(
            new ErrorResponse(
                `Please upload an image file.`,
                400
            )
        );
    }

    // Check image file size.
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}.`,
                400
            )
        );
    }

    // Create custom filename
    file.name = `photo_${bootcampData._id}${path.parse(file.name).ext}`;

    // Upload image file.
    // console.log(file)
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err, _) => {
        if (err) {
            return next(
                new ErrorResponse(
                    `Problem in uploading the image file.`,
                    500
                )
            );
        }

        const updatedBootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
            success: true,
            data: updatedBootcamp
        });
    });
});