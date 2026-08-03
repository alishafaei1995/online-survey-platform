import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const MAX_MEMBERS = 10;

export async function listUsers(req, res) {
  const users = await User.find().select('-passwordHash').sort({ createdAt: 1 });
  res.json({ users });
}

export async function createUser(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const memberCount = await User.countDocuments({ role: 'member', active: true });
  if (memberCount >= MAX_MEMBERS) {
    return res.status(400).json({ message: `Maximum of ${MAX_MEMBERS} active member users reached` });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) return res.status(409).json({ message: 'A user with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    role: 'member',
  });

  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, active: user.active } });
}

export async function setUserActive(req, res) {
  const { id } = req.params;
  const { active } = req.body;
  if (typeof active !== 'boolean') return res.status(400).json({ message: 'active must be a boolean' });

  if (id === req.user.id) {
    return res.status(400).json({ message: 'You cannot change your own access status' });
  }

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.active = active;
  await user.save();
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, active: user.active } });
}

export async function deleteUser(req, res) {
  const { id } = req.params;

  if (id === req.user.id) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') {
    return res.status(400).json({ message: 'Admin accounts cannot be deleted' });
  }

  await user.deleteOne();
  res.json({ message: 'Deleted' });
}
