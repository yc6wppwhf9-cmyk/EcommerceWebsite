import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const getSetting = async (req: Request, res: Response) => {
  const { key } = req.params;
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Setting not found' });
  res.json(data.value);
};

export const upsertSetting = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const { key } = req.params;
  const value = req.body;

  if (!value || typeof value !== 'object') {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ key, value }, { onConflict: 'key' })
    .select('value')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data.value);
};
