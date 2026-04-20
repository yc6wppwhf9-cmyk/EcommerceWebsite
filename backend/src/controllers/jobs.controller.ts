import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const getJobs = async (req: Request, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query;
  try {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' });

    if (status && status !== 'all') query = query.eq('status', status);
    else if (!status) query = query.eq('status', 'open');

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;
    res.json({ jobs: data || [], pagination: { page: pageNum, limit: limitNum, total: count || 0, pages: Math.ceil((count || 0) / limitNum) } });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch jobs', message: err.message });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('jobs').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Job not found' });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

export const createJob = async (req: AuthRequest, res: Response) => {
  const { title, description, location, department, job_type, salary_min, salary_max, requirements, status } = req.body;
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert({ title, description, location, department, job_type, salary_min, salary_max, requirements, status: status || 'draft', posted_by: req.user?.id })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  const allowed = ['title', 'description', 'location', 'department', 'job_type', 'salary_min', 'salary_max', 'requirements', 'status'];
  const updates: Record<string, any> = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  if (!Object.keys(updates).length) return res.status(400).json({ error: 'No fields to update' });

  try {
    const { data, error } = await supabase.from('jobs').update(updates).eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ error: 'Job not found' });
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase.from('jobs').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Job deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete job', message: err.message });
  }
};

export const getAllApplications = async (req: AuthRequest, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query;
  try {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('applications')
      .select('*, jobs(id, title, location, job_type), users(id, name, email)', { count: 'exact' });

    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error, count } = await query
      .order('applied_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;
    res.json({ applications: data || [], pagination: { page: pageNum, limit: limitNum, total: count || 0 } });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch applications', message: err.message });
  }
};

export const getJobApplications = async (req: AuthRequest, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query;
  try {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('applications')
      .select('*, jobs(id, title), users(id, name, email)', { count: 'exact' })
      .eq('job_id', req.params.jobId);

    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error, count } = await query
      .order('applied_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;
    res.json({ applications: data || [], pagination: { page: pageNum, limit: limitNum, total: count || 0 } });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch applications', message: err.message });
  }
};

export const submitApplication = async (req: AuthRequest, res: Response) => {
  const { jobId } = req.params;
  const { name, email, phone, cover_letter, resume_url } = req.body;
  try {
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('applicant_email', email)
      .maybeSingle();

    if (existing) return res.status(400).json({ error: 'You have already applied for this job' });

    const { data, error } = await supabase
      .from('applications')
      .insert({ job_id: jobId, applicant_name: name, applicant_email: email, applicant_phone: phone, cover_letter: cover_letter || null, resume_url: resume_url || null, status: 'pending' })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  const valid = ['pending', 'shortlisted', 'rejected', 'hired'];
  if (!valid.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });

  try {
    const { data, error } = await supabase
      .from('applications')
      .update({ status: req.body.status })
      .eq('id', req.params.appId)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Application not found' });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};
