const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Sedan', 'SUV', 'Innova', 'Tempo Traveller']
  },
  costPerKm: {
    type: Number,
    required: true
  },
  driverAllowancePerDay: {
    type: Number,
    required: true
  },
  nightHaltCharge: {
    type: Number,
    required: true
  },
  customCharges: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
