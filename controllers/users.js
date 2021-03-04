const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../custom_middleware/async');
const User = require('../models/User');

//@desc         Get all users
//@desc         GET /api/v1/auth/users
//@desc         Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

//@desc         Get single user
//@desc         POST /api/v1/auth/users/:id
//@desc         Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    console.log('the req id ', req.param.id)
    const user = await User.findById(req.params.id);
    console.log('the user ', user)
    res.status(200).json({
        success: true,
        data: user
    })
});

//@desc         Create user
//@desc         POST /api/v1/auth/users
//@desc         Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: user
    })
});

//@desc         Update user
//@desc         PUT /api/v1/auth/users/:id
//@desc         Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    })
});

//@desc         Delete user
//@desc         DELETE /api/v1/auth/users/:id
//@desc         Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        data: {}
    })
});