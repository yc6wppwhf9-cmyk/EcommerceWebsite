import { Router, Request, Response } from 'express';
import { sendEmail } from '../lib/mail';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  if (message.trim().length < 10) {
    return res.status(400).json({ error: 'Message must be at least 10 characters.' });
  }

  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
      <h2 style="font-weight: 700; font-size: 24px; color: #000; margin-bottom: 24px;">New Contact Form Message</h2>
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
        <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
        <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 8px 0;"><strong>Subject:</strong> ${subject}</p>
      </div>
      <div>
        <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Message</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #333; white-space: pre-line;">${message}</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 32px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Priority Bags Contact Form</p>
    </div>
  `;

  await sendEmail('info@prioritybags.in', `[Contact] ${subject} — ${name}`, html);

  return res.json({ message: 'Message sent successfully.' });
});

export default router;
