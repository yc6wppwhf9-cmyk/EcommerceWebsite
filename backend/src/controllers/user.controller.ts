import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, is_verified, created_at')
      .eq('id', req.user!.id)
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  const { name, phone } = req.body;
  const updates: Record<string, string> = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;

  if (!Object.keys(updates).length)
    return res.status(400).json({ error: 'No fields to update' });

  try {
    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user!.id)
      .select('id, name, email, phone, role, is_verified, created_at')
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

// ─── Addresses ────────────────────────────────────────────────────────────────

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch addresses', message: err.message });
  }
};

export const addAddress = async (req: AuthRequest, res: Response) => {
  const { name, phone, line1, line2, city, state, pincode, is_default } = req.body;

  if (!name || !phone || !line1 || !city || !state || !pincode)
    return res.status(400).json({ error: 'name, phone, line1, city, state and pincode are required' });

  try {
    // If this is set as default, unset all other defaults first
    if (is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.user!.id);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({ user_id: req.user!.id, name, phone, line1, line2: line2 || null, city, state, pincode, is_default: !!is_default })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add address', message: err.message });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    // Verify the address belongs to this user before deleting
    const { data: addr, error: fetchErr } = await supabase
      .from('addresses')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchErr || !addr) return res.status(404).json({ error: 'Address not found' });
    if (addr.user_id !== req.user!.id)
      return res.status(403).json({ error: 'Cannot delete another user\'s address' });

    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) throw error;

    res.json({ message: 'Address deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete address', message: err.message });
  }
};
