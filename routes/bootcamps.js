const express = require('express');
const {
    getBootcamp,
    getBootcamps,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp
} = require('../controllers/bootcamp');
const router = express.Router();

/*The idea is to separate the API from the main file which 
is the server.js. app.get will be changed since we don't have access 
to app and instead will be using router.get
*/
/*The route api/v1/bootcamps set in server.js, in here the router.route
('/') specifies that anything from route api/v1/bootcamps will use the
 following get and post method we created in the controller. */
router.route('/').get(getBootcamps).post(createBootcamp);

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);


module.exports = router;