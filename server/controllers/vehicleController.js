const supabase = require('../config/supabase');

// Helper to map Supabase database ID to _id for frontend compatibility
const mapVehicle = (vehicle) => {
  if (!vehicle) return null;
  return {
    ...vehicle,
    _id: vehicle.id,
  };
};

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
const getVehicles = async (req, res, next) => {
  try {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      res.status(500);
      throw error;
    }

    res.json((vehicles || []).map(mapVehicle));
  } catch (error) {
    next(error);
  }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private
const createVehicle = async (req, res, next) => {
  try {
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      res.status(400);
      throw error;
    }

    res.status(201).json(mapVehicle(vehicle));
  } catch (error) {
    next(error);
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = async (req, res, next) => {
  try {
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      res.status(400);
      throw error;
    }

    if (!vehicle) {
      res.status(404);
      throw new Error('Vehicle not found');
    }

    res.json(mapVehicle(vehicle));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      res.status(400);
      throw error;
    }

    res.json({ message: 'Vehicle removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVehicles, createVehicle, updateVehicle, deleteVehicle };
