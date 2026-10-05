import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, httpError } from '../utils/httpError.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const send = (res, status, user) =>
  res.status(status).json({
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email },
  });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw httpError(400, 'Name, email and password are required.');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw httpError(400, 'Enter a valid email address.');
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters.');

  const user = await User.create({ name, email, password });
  send(res, 201, user);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required.');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw httpError(401, 'Incorrect email or password.');
  send(res, 200, user);
});

export const me = asyncHandler(async (req, res) => {
  const { _id, name, email } = req.user;
  res.json({ user: { id: _id, name, email } });
});
