const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../custom_middleware/async');

// @desc        Get courses
// @route       GET /api/v1/courses
// @route       GET /api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.getCourses = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId });

        // Return courses related to a specific Bootcamp.
        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        // Return all courses.
        res.status(200).json(res.advancedResults);
    };
});

// @desc        Get single courses
// @route       GET /api/v1/courses/:id
// @access      Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        count: course.length,
        data: course
    });

});

// @desc        Add courses
// @route       POST /api/v1/bootcamps/:bootcampsId/courses
// @access      Private
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `No bootcamp with the id of ${req.params.bootcamp}`,
                404
            )
        )
    }

    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
                401
            )
        );
    }

    // Check how many course the user has created.
    const {
        courseCreatedCount,
        courseCreatedCountLimit
    } = await User
                .findById(req.user.id)
                .select(['+courseCreatedCount', '+courseCreatedCountLimit']);

    if (courseCreatedCount >= courseCreatedCountLimit) {
        return next(
            new ErrorResponse(
                `The user with ID ${req.user.id} has already reached limit in creating new course.`,
                403
            )
        );
    } else {
        // Check if has same course title.
        const course = await Course.findOne({ title: req.body.title });
        if (course) {
            return next(
                new ErrorResponse(
                    `The course title ${req.body.title} has already been taken.`,
                    403
                )
            );
        }

        //Create if no found same title.
        course = await Course.create(req.body);

        res.status(200).json({
            success: true,
            data: course
        });
    }

});

// @desc        Update courses
// @route       PUT /api/v1/courses/:id
// @access      Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse(
                `No course with the id of ${req.params.id}`,
                404
            )
        )
    };

    // Make sure user is bootcamp owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this course ${course._id}`,
                401
            )
        );
    }

    course = await Course.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        data: course
    });

});

// @desc        Delete courses
// @route       DELETE /api/v1/courses/:id
// @access      Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse(
                `No course with the id of ${req.params.id}`,
                404
            )
        )
    };

    // Make sure user is bootcamp owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete this course ${course._id}`,
                401
            )
        );
    }

    await course.remove();

    res.status(200).json({
        success: true,
        data: {}
    });

});