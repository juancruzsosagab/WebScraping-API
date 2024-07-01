import { generateToken } from '../utils/authUtils.js';
import dotenv from 'dotenv';

dotenv.config();

export async function login(req, res) {
  const { username, password } = req.body;

  const validUsername = process.env.USERNAME_API;
  const validPassword = process.env.PASSWORD_API;

  try {
    if (username !== validUsername || password !== validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ username });
    res.json({ token });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}