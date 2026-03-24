const Trip = require('../models/Trip');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({}).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    next(error);
  }
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Public
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ tripId: req.params.id });
    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }
    res.json(trip);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Public
const createTrip = async (req, res, next) => {
  try {
    const trip = await Trip.create(req.body);
    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Analytics Summary
// @route   GET /api/trips/analytics/summary
// @access  Private
const getAnalytics = async (req, res, next) => {
  try {
    const totalTrips = await Trip.countDocuments();
    
    // Revenue logic (sum of total costs)
    const revenuePipeline = await Trip.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$costs.total' } } }
    ]);
    const totalRevenue = revenuePipeline.length > 0 ? revenuePipeline[0].totalRevenue : 0;

    res.json({ totalTrips, totalRevenue });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTrips, getTripById, createTrip, getAnalytics };
