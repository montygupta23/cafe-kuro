import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET , { expiresIn: '7d' });
};

export const loginAdmin = async (req, res) => {
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  try {
    let user = await User.findOne({ email });
    
    // Auto seed default admin if empty
    if (
      !user &&
      email === process.env.ADMIN_EMAIL?.trim().toLowerCase() &&
      password === process.env.ADMIN_PASSWORD
    ) {
      user = await User.create({
        name: 'Administrator',
        email,
        password: process.env.ADMIN_PASSWORD,
        role: 'Admin'
      });
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
