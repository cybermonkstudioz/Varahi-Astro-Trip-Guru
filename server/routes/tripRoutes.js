const express = require('express');
const router = express.Router();
const { getTrips, getTripById, createTrip, getAnalytics } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTrips).post(createTrip);
router.route('/analytics/summary').get(protect, getAnalytics);
router.route('/:id').get(getTripById);

module.exports = router;
