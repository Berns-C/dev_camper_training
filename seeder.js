// Seeder.js is created for faster data creation and deletion for DB.
const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env variables.
dotenv.config({ path: './config/config.env' });

// Load models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

// Read the JSON files
const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);
const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);
const users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);
const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
);

// Import JSON into DB
const importData = async () => {
    try {
        await User.create(users);
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await Review.create(reviews);

        console.log('Data imported.. '.green.inverse);
        process.exit();
    } catch (error) {
        console.log(error.red);
    }
};

// Delete data
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data destroyed.. '.red.inverse);
        process.exit();
    } catch (error) {
        console.log(error.red);
    }
};

if (process.argv[2] === '-i' || process.argv[2] === '-I') {
    importData();
} else if (process.argv[2] === '-d' || process.argv[2] === '-D') {
    deleteData();
}

//command in cli 'node seeder -i' for create data
//command in cli 'node seeder -d' for delete data