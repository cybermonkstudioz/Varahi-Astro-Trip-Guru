const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  address: String,
  lat: Number,
  lng: Number
}, { _id: false });

const tripSchema = new mongoose.Schema({
  tripId: {
    type: String,
    required: true,
    unique: true
  },
  tripType: {
    type: String,
    required: true,
    enum: ['One-way', 'Round', 'Multi-city']
  },
  source: locationSchema,
  destination: locationSchema,
  stops: [locationSchema],
  vehicleType: {
    type: String,
    required: true
  },
  dates: {
    start: Date,
    end: Date
  },
  passengers: {
    type: Number,
    required: true
  },
  metrics: {
    distance: Number,
    duration: String
  },
  costs: {
    baseCost: Number,
    tolls: Number,
    driverAllowance: Number,
    nightCharges: Number,
    total: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
