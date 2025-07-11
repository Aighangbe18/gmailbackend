import User from '../Models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// ✅ REGISTER
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
      },
      token,
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// ✅ LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user._id);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
      },
      token,
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// ✅ UPDATE PROFILE
export const updateProfile = async (req, res) => {
  const userId = req.params.id;
  const { name, email, password } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ error: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      user.avatar = req.file.path; // assuming multer handles uploads
    }

    await user.save();

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
      },
    });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ error: 'Profile update failed' });
  }
};
