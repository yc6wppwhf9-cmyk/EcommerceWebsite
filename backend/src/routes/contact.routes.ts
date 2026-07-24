import { Router, Request, Response } from 'express';
import { sendEmail } from '../lib/mail';
import { escapeHtml } from '../lib/sanitize';
import { createSupportTicket } from '../lib/support.service';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (name.trim().length > 120 || subject.trim().length > 200 || message.trim().length > 4000) {
    return res.status(400).json({ error: 'One or more fields are too long.' });
  }
  if (message.trim().length < 10) {
    return res.status(400).json({ error: 'Message must be at least 10 characters.' });
  }

  try {
    const ticket = await createSupportTicket({
      type: 'contact',
      name: name.trim(),
      email,
      subject: subject.trim(),
      message: message.trim(),
    });
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);
    const headerSubject = subject.replace(/[\r\n]+/g, ' ').trim().slice(0, 120);

    void sendEmail(
      'info@prioritybags.in',
      `[${ticket.ticket_number}] ${headerSubject}`,
      `<h2>New customer support request</h2>
       <p><strong>Ticket:</strong> ${ticket.ticket_number}</p>
       <p><strong>Name:</strong> ${safeName}</p>
       <p><strong>Email:</strong> ${safeEmail}</p>
       <p><strong>Subject:</strong> ${safeSubject}</p>
       <p style="white-space:pre-line">${safeMessage}</p>`,
    );

    return res.status(201).json({
      message: 'Message received successfully.',
      ticket_number: ticket.ticket_number,
    });
  } catch (err) {
    console.error('Contact request error:', err);
    return res.status(500).json({ error: 'Unable to create your support request. Please try again.' });
  }
});

export default router;
