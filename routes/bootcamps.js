const express = require('express');
const {
    getBootcamp,
    getBootcamps,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload,
    retrieveUserPublishedBootcamp,
} = require('../controllers/bootcamp');
const Bootcamp = require('../models/Bootcamp');

// Include other resource router.
const courseRouter = require('./courses');
const reviewsRouter = require('./reviews');

const router = express.Router();

const { protect, authorize } = require('../custom_middleware/auth');
const advancedResults = require('../custom_middleware/advanced-results');

// Re-route into other resource  router
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewsRouter);

/*The idea is to separate the API from the main file which
is the server.js. app.get will be changed since we don't have access
to app and instead will be using router.get
*/
/*The route api/v1/bootcamps set in server.js, in here the router.route
('/') specifies that anything from route api/v1/bootcamps will use the
 following get and post method we created in the controller. */

router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius);

router
    .route('/user/published-bootcamps')
    .get(
        protect,
        authorize('publisher', 'admin'),
        retrieveUserPublishedBootcamp
    );

router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(
        protect,
        authorize('publisher', 'admin'),
        createBootcamp
    );

router
    .route('/:id')
    .get(getBootcamp)
    .put(
        protect,
        authorize('publisher', 'admin'),
        updateBootcamp
    )
    .delete(
        protect,
        authorize('publisher', 'admin'),
        deleteBootcamp
    );

router
    .route('/:id/photo')
    .put(
        protect,
        authorize('publisher', 'admin'),
        bootcampPhotoUpload
    );

module.exports = router;