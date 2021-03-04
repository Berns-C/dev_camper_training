const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Userschema = mongoose.Schema({
    name: {
        type: String,
        require: [true,]
    },
    email: {
        type: String,
        require: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'publisher', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    courseCreatedCount: {
        type: Number,
        default: 0,
        select: false
    },
    courseCreatedCountLimit: {
        type: Number,
        default: 5,
        select: false
    },
});

// Encrypt password using bcrypt.

Userschema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
Userschema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Match user entered password to hashed password in database.
Userschema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Generate and has password token
Userschema.methods.getResetPasswordToken = function() {
    // Generate a token
    const resetToken = crypto.randomBytes(20).toString('hex');

    console.log('the reset token ', resetToken);

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set Expire
    this.resetPasswordExpire = Date.now() + 10 + 60 * 1000;

    return resetToken;
}

module.exports = mongoose.model('User', Userschema);