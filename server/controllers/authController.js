const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
const authAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch(error) {
    next(error);
  }
};

// @desc    Register a new admin (Setup utility)
// @route   POST /api/auth/register
// @access  Public (Should be protected or removed in prod)
const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      res.status(400);
      throw new Error('Admin already exists');
    }

    const admin = await Admin.create({ name, email, password });

    if (admin) {
      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid admin data');
    }
  } catch(error) {
    next(error);
  }
};

module.exports = { authAdmin, registerAdmin };
