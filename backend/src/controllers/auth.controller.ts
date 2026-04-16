import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase } from '../config/supabase';
import { config } from '../config/env';
import * as Mailer from '../lib/mail';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' });

  try {
    const hash = await bcrypt.hash(password, 12);
    const vToken = crypto.randomBytes(32).toString('hex');

    const { data: user, error } = await supabase
      .from('users')
      .insert({ 
        name, 
        email, 
        password: hash, 
        phone: phone || null,
        is_verified: false,
        verification_token: vToken
      })
      .select('id, name, email, phone, role, is_verified, created_at')
      .single();

    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'Email already registered' });
      throw error;
    }

    // Send Verification Email
    const vUrl = `http://localhost:3000/verify-email?token=${vToken}`; // Projects Vite Port is 3000
    await Mailer.sendEmail(
      email,
      'Verify Your Account - Priority Bags',
      Mailer.getVerificationTemplate(name, vUrl)
    );

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token, message: 'Registration successful. Please check your email for verification.' });
  } catch (err: any) {
    console.error('register error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token is required' });

  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({ is_verified: true, verification_token: null })
      .eq('verification_token', token)
      .select()
      .single();

    if (error || !user) return res.status(400).json({ error: 'Invalid or expired verification token' });

    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const rToken = crypto.randomBytes(32).toString('hex');
    const rExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    const { data: user, error } = await supabase
      .from('users')
      .update({ reset_token: rToken, reset_token_expires: rExpires })
      .eq('email', email)
      .select('id, name, email')
      .single();

    if (error || !user) {
      // Don't reveal if user exists
      return res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
    }

    const rUrl = `http://localhost:3000/reset-password?token=${rToken}`;
    await Mailer.sendEmail(
      email,
      'Password Reset Request - Priority Bags',
      Mailer.getPasswordResetTemplate(user.name, rUrl)
    );

    res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const changePassword = async (req: any, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });

    const hash = await bcrypt.hash(newPassword, 12);
    await supabase
      .from('users')
      .update({ password: hash })
      .eq('id', userId);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });

  try {
    const hash = await bcrypt.hash(password, 12);
    
    const { data: user, error } = await supabase
      .from('users')
      .update({ 
        password: hash, 
        reset_token: null, 
        reset_token_expires: null 
      })
      .eq('reset_token', token)
      .gt('reset_token_expires', new Date().toISOString())
      .select()
      .single();

    if (error || !user) return res.status(400).json({ error: 'Invalid or expired reset token' });

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.is_verified) return res.status(403).json({ error: 'Please verify your email address before logging in' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, is_verified: user.is_verified, created_at: user.created_at },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
