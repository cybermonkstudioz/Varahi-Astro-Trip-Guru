const express = require('express');
const router = express.Router();
const { getVehicles, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getVehicles).post(protect, createVehicle);
router.route('/:id').put(protect, updateVehicle).delete(protect, deleteVehicle);

module.exports = router;
