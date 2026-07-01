const supabase = require('../config/supabase');

// Helper to map Supabase database ID to _id for frontend compatibility
const mapTrip = (trip) => {
  if (!trip) return null;
  return {
    ...trip,
    _id: trip.id,
  };
};

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res, next) => {
  try {
    const { data: trips, error } = await supabase
      .from('trips')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      res.status(500);
      throw error;
    }

    res.json((trips || []).map(mapTrip));
  } catch (error) {
    next(error);
  }
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Public
const getTripById = async (req, res, next) => {
  try {
    const { data: trip, error } = await supabase
      .from('trips')
      .select('*')
      .eq('tripId', req.params.id)
      .maybeSingle();

    if (error) {
      res.status(500);
      throw error;
    }

    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    res.json(mapTrip(trip));
  } catch (error) {
    next(error);
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Public
const createTrip = async (req, res, next) => {
  try {
    const { data: trip, error } = await supabase
      .from('trips')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      res.status(400);
      throw error;
    }

    res.status(201).json(mapTrip(trip));
  } catch (error) {
    next(error);
  }
};

// @desc    Get Analytics Summary
// @route   GET /api/trips/analytics/summary
// @access  Private
const getAnalytics = async (req, res, next) => {
  try {
    // 1. Get total trips count
    const { count, error: countError } = await supabase
      .from('trips')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      res.status(500);
      throw countError;
    }

    // 2. Get total revenue (sum of costs.total)
    const { data: tripsCosts, error: costsError } = await supabase
      .from('trips')
      .select('costs');

    if (costsError) {
      res.status(500);
      throw costsError;
    }

    const totalRevenue = (tripsCosts || []).reduce((acc, item) => {
      // costs is stored as JSONB, so it is returned as an object directly
      const total = item.costs ? (item.costs.total || 0) : 0;
      return acc + Number(total);
    }, 0);

    res.json({ 
      totalTrips: count || 0, 
      totalRevenue: totalRevenue || 0 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTrips, getTripById, createTrip, getAnalytics };
