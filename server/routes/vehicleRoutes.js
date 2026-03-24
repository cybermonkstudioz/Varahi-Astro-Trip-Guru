const express = require('express');
const router = express.Router();
const { getVehicles, createVehicle, updateVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getVehicles).post(protect, createVehicle);
router.route('/:id').put(protect, updateVehicle);

module.exports = router;
