const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const { data: admin, error } = await supabase
        .from('admins')
        .select('id, email, name, "createdAt", "updatedAt"')
        .eq('id', decoded.id)
        .single();

      if (error || !admin) {
        res.status(401);
        return next(new Error('Not authorized, token failed'));
      }

      // Map UUID to _id to keep compatibility with existing mongoose usage
      req.admin = {
        ...admin,
        _id: admin.id
      };
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

module.exports = { protect };
