import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { supabase } from '../config/supabase';
import { sendEmail, getCorporateInquiryEmailTemplate, getCorporateInquiryAckTemplate } from '../lib/mail';
import { escapeHtml } from '../lib/sanitize';

const router = Router();

// Dedicated corporate desk email recipient
const CORPORATE_DESK_EMAIL = 'ayyappan.kp@hscvpl.com';

function generateReferenceNumber(now = new Date()): string {
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CORP-${dateStr}-${randomHex}`;
}

router.post('/', async (req: Request, res: Response) => {
  const {
    name,
    phone,
    organisation_name,
    email,
    quantity,
    location,
    approx_budget,
    category,
    notes,
  } = req.body;

  // Validation
  if (!name || !phone || !organisation_name || !email || !quantity || !location || !category) {
    return res.status(400).json({
      error: 'Please fill in all required fields: Name, Phone, Organisation, Email, Quantity, Location, and Category.',
    });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const cleanPhone = String(phone).trim();
  if (cleanPhone.length < 8 || cleanPhone.length > 20) {
    return res.status(400).json({ error: 'Please provide a valid mobile number.' });
  }

  const cleanName = String(name).trim();
  const cleanOrg = String(organisation_name).trim();
  const cleanQty = String(quantity).trim();
  const cleanLoc = String(location).trim();
  const cleanBudget = approx_budget ? String(approx_budget).trim() : 'Flexible';
  const cleanCategory = String(category).trim();
  const cleanNotes = notes ? String(notes).trim().slice(0, 4000) : '';

  const referenceNumber = generateReferenceNumber();

  try {
    // 1. Insert into Supabase database
    const { data: dbData, error: dbError } = await supabase
      .from('corporate_inquiries')
      .insert({
        reference_number: referenceNumber,
        name: cleanName,
        phone: cleanPhone,
        organisation_name: cleanOrg,
        email: cleanEmail,
        quantity: cleanQty,
        location: cleanLoc,
        approx_budget: cleanBudget,
        category: cleanCategory,
        notes: cleanNotes,
        status: 'new',
      })
      .select('id, reference_number, created_at')
      .single();

    if (dbError) {
      console.warn('⚠️ Supabase insert warning (corporate_inquiries):', dbError.message);
      // Even if table doesn't exist yet or has an RLS policy issue, proceed to send the email notification
    }

    // 2. Send email notification to ayyappan.kp@hscvpl.com
    const emailSubject = `[Corporate Inquiry: ${referenceNumber}] ${cleanOrg} - ${cleanQty} ${cleanCategory}`;
    const emailHtml = getCorporateInquiryEmailTemplate({
      referenceNumber,
      name: cleanName,
      phone: cleanPhone,
      organisationName: cleanOrg,
      email: cleanEmail,
      quantity: cleanQty,
      location: cleanLoc,
      approxBudget: cleanBudget,
      category: cleanCategory,
      notes: cleanNotes,
    });

    void sendEmail(CORPORATE_DESK_EMAIL, emailSubject, emailHtml);

    // 3. Send acknowledgement copy to applicant
    const ackSubject = `We've received your corporate requirement [${referenceNumber}] - Priority Bags`;
    const ackHtml = getCorporateInquiryAckTemplate(cleanName, referenceNumber, cleanOrg);
    void sendEmail(cleanEmail, ackSubject, ackHtml);

    return res.status(201).json({
      success: true,
      message: 'Corporate requirement submitted successfully.',
      reference_number: referenceNumber,
      inquiry_id: dbData?.id,
    });
  } catch (err: any) {
    console.error('❌ Corporate inquiry submission error:', err);
    return res.status(500).json({
      error: 'Unable to submit your corporate requirement. Please try again or contact ayyappan.kp@hscvpl.com directly.',
    });
  }
});

export default router;
