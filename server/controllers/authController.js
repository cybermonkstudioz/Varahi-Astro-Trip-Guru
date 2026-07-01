const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

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

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      res.status(500);
      throw error;
    }

    if (admin && (await bcrypt.compare(password, admin.password))) {
      res.json({
        _id: admin.id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin.id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new admin (Setup utility)
// @route   POST /api/auth/register
// @access  Public (Should be protected or removed in prod)
const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const { data: adminExists, error: checkError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      res.status(500);
      throw checkError;
    }

    if (adminExists) {
      res.status(400);
      throw new Error('Admin already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: admin, error: createError } = await supabase
      .from('admins')
      .insert({ name: name || 'Admin', email, password: hashedPassword })
      .select()
      .single();

    if (createError) {
      res.status(400);
      throw createError;
    }

    if (admin) {
      res.status(201).json({
        _id: admin.id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin.id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid admin data');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { authAdmin, registerAdmin };
