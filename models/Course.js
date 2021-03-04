const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, ' Please add course title']
    },
    description: {
        type: String,
        required: [true, ' Please add course description']
    },
    weeks: {
        type: String,
        required: [true, ' Please add number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, ' Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true, ' Please add minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// Static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function(bootcampId) {
    console.log('Calculating avg cost..'.blue);

    const obj = await this.aggregate([
        { $match: { bootcamp: bootcampId } },
        {   $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' }
            }   }
    ]);

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        });
    } catch (error) {
        console.log(error);
    }
};

// Increase or decrease  course created count
CourseSchema.statics.updateCourseCreatedCount = async function(userId, type) {
    try {
        const { courseCreatedCount } = await this.model('User')
                                        .findById(userId)
                                        .select('+courseCreatedCount');
        let newCount = type === 'remove'
                        ? courseCreatedCount > 0 ? courseCreatedCount - 1  : 0
                        : courseCreatedCount + 1;
        await this.model('User').findByIdAndUpdate(userId, {
            courseCreatedCount: newCount
        });
    } catch (error) {
        console.log('updateCourseCreatedCount error ', error)
    }
};

// Call getAverageCost after save.
CourseSchema.post('save', async function(next) {
    //Run the static
    await this.constructor.getAverageCost(this.bootcamp);
});

// Add count to course created count
CourseSchema.post('save', async function(next){
    await this.constructor.updateCourseCreatedCount(this.user);
});

// Call getAverageCost before remove.
CourseSchema.pre('remove', async function(next) {
    //Run the static
    await this.constructor.getAverageCost(this.bootcamp);
});

CourseSchema.pre('remove', async function(next) {
    //Run the static
    await this.constructor.updateCourseCreatedCount(this.user, 'remove');
});

module.exports = mongoose.model('Course', CourseSchema);