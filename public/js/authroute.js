const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Helper to generate a simple userId return (we use Mongo _id)
function safeUser(user) {
  if (!user) return null;
  return {
    userId: user._id,
    userRole: user.userRole,
    username: user.username,
    fullName: user.fullName
  };
}

// POST /api/auth/register
// Create a new user (used by admin UI or initial bootstrap)
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, fullName, station, email } = req.body;
    if (!username || !password || !role) return res.status(400).json({ success: false, message: 'username, password and role required' });

    const exists = await User.findOne({ username: username.toLowerCase() });
    if (exists) return res.status(400).json({ success: false, message: 'Username already exists' });

    const u = new User({
      username: username.toLowerCase(),
      password,
      userRole: role,
      fullName,
      station,
      email
    });
    await u.save();
    res.json({ success: true, message: 'User created', user: safeUser(u) });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'username and password required' });

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.json({ success: true, ...safeUser(user) });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Admin helpers (simple endpoints used by admin UI)
// POST /api/auth/admin/create-user  (alternatively your frontend calls /api/admin/create-user)
router.post('/admin/create-user', async (req, res) => {
  try {
    const { username, password, role, fullName, station, email } = req.body;
    if (!username || !password || !role) return res.status(400).json({ success: false, message: 'username, password and role required' });
    const exists = await User.findOne({ username: username.toLowerCase() });
    if (exists) return res.status(400).json({ success: false, message: 'Username exists' });

    const u = new User({
      username: username.toLowerCase(),
      password,
      userRole: role,
      fullName,
      station,
      email
    });
    await u.save();
    res.json({ success: true, message: 'User created', user: safeUser(u) });
  } catch (err) {
    console.error('admin create user error', err);
    res.status(500).json({ success: false, message: 'Could not create user' });
  }
});

// GET /api/auth/admin/users  (list all users)
router.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    console.error('admin list users error', err);
    res.status(500).json({ message: 'Failed to load users' });
  }
});

// DELETE /api/auth/admin/users/delete/:username
router.delete('/admin/users/delete/:username', async (req, res) => {
  try {
    const username = (req.params.username || '').toLowerCase();
    if (!username) return res.status(400).json({ message: 'username required' });

    const r = await User.deleteOne({ username });
    if (r.deletedCount === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('delete user error', err);
    res.status(500).json({ message: 'Delete failed' });
  }
});

// GET /api/auth/users/:id  (get user by id)
router.get('/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id, '-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('get user error', err);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

module.exports = router;