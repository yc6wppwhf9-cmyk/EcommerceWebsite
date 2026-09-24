import { Resend } from 'resend';
import { config } from '../config/env';
import { escapeHtml } from './sanitize';

const resend = config.RESEND_API_KEY ? new Resend(config.RESEND_API_KEY) : null;

const APP_NAME = 'Priority Bags';
const PRIMARY_COLOR = '#000000';

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!resend) {
    console.log(`ℹ️ [Email Dev Mode] To: ${to}, Subject: ${subject}`);
    return;
  }
  const recipient = (to || '').trim();
  try {
    const { error } = await resend.emails.send({
      from: `${APP_NAME} <${config.FROM_EMAIL}>`,
      to: recipient,
      subject,
      html,
    });
    if (error) console.error('❌ Email Sending Failed:', error);
  } catch (err) {
    console.error('❌ Email Sending Failed:', err);
  }
};

export const getVerificationTemplate = (name: string, url: string) => `
  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
    <h2 style="font-weight: 700; font-size: 24px; color: ${PRIMARY_COLOR}; margin-bottom: 24px;">Welcome to Priority Bags</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${escapeHtml(name)},</p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Please verify your email address to complete your registration at the Digital Atelier.</p>
    <div style="margin: 32px 0;">
      <a href="${url}" style="background: ${PRIMARY_COLOR}; color: white; padding: 14px 28px; text-decoration: none; font-weight: 600; border-radius: 4px; display: inline-block;">Verify Email</a>
    </div>
    <p style="font-size: 14px; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 32px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Priority Bags. All rights reserved.</p>
  </div>
`;

export const getPasswordResetTemplate = (name: string, url: string) => `
  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
    <h2 style="font-weight: 700; font-size: 24px; color: ${PRIMARY_COLOR}; margin-bottom: 24px;">Reset Your Password</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${escapeHtml(name)},</p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">We received a request to reset your password. Click the button below to choose a new one.</p>
    <div style="margin: 32px 0;">
      <a href="${url}" style="background: ${PRIMARY_COLOR}; color: white; padding: 14px 28px; text-decoration: none; font-weight: 600; border-radius: 4px; display: inline-block;">Reset Password</a>
    </div>
    <p style="font-size: 14px; color: #666;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 32px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Priority Bags. All rights reserved.</p>
  </div>
`;

export const getOrderShippedTemplate = (name: string, orderId: string, invoiceUrl?: string) => `
  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
    <h2 style="font-weight: 700; font-size: 24px; color: ${PRIMARY_COLOR}; margin-bottom: 24px;">Your Order is on the Way!</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${escapeHtml(name)},</p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Great news! Your order <strong>#${orderId.slice(0,8).toUpperCase()}</strong> has been shipped and is heading your way.</p>
    ${invoiceUrl ? `
    <div style="margin: 32px 0;">
      <a href="${invoiceUrl}" style="background: ${PRIMARY_COLOR}; color: white; padding: 14px 28px; text-decoration: none; font-weight: 600; border-radius: 4px; display: inline-block;">View Invoice</a>
    </div>
    ` : ''}
    <p style="font-size: 14px; color: #666;">You can track your order status in your dashboard.</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 32px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Priority Bags. All rights reserved.</p>
  </div>
`;

export const getReturnRequestedTemplate = (name: string, orderId: string, reason: string) => `
  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
    <h2 style="font-weight: 700; font-size: 24px; color: ${PRIMARY_COLOR}; margin-bottom: 24px;">Return Request Received</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${escapeHtml(name)},</p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">We have received your return request for order <strong>#${orderId.slice(0,8).toUpperCase()}</strong>.</p>
    <div style="background: #f9f9f9; padding: 16px 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid ${PRIMARY_COLOR};">
      <p style="margin: 0; font-size: 13px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Your Reason</p>
      <p style="margin: 8px 0 0; font-size: 15px; color: #333; line-height: 1.5;">${escapeHtml(reason)}</p>
    </div>
    <p style="font-size: 14px; color: #666;">Our team will review your request and process it within 2–3 business days. You will receive a refund confirmation once approved.</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 32px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Priority Bags. All rights reserved.</p>
  </div>
`;

export const getReturnApprovedTemplate = (name: string, orderId: string) => `
  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
    <h2 style="font-weight: 700; font-size: 24px; color: ${PRIMARY_COLOR}; margin-bottom: 24px;">Refund Processed</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${escapeHtml(name)},</p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Your return for order <strong>#${orderId.slice(0,8).toUpperCase()}</strong> has been approved and your refund is on the way.</p>
    <p style="font-size: 14px; color: #666;">Refunds typically appear in your account within 5–7 business days depending on your bank or card issuer.</p>
    <p style="font-size: 14px; color: #666;">Thank you for shopping with Priority Bags. We hope to serve you again soon.</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 32px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Priority Bags. All rights reserved.</p>
  </div>
`;

export const getAbandonedCartTemplate = (name: string, items: { name: string; price: number; image?: string; quantity: number }[], cartUrl: string) => `
  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
    <h2 style="font-weight: 700; font-size: 24px; color: ${PRIMARY_COLOR}; margin-bottom: 8px;">You left something behind!</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${escapeHtml(name)},</p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Your cart is waiting. Complete your order before your items sell out.</p>
    <div style="margin: 24px 0; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden;">
      ${items.map(item => `
        <div style="display: flex; align-items: center; padding: 16px; border-bottom: 1px solid #f0f0f0; gap: 16px;">
          ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.name)}" style="width: 60px; height: 60px; object-fit: contain; border-radius: 6px; border: 1px solid #f0f0f0;" />` : ''}
          <div style="flex: 1;">
            <p style="margin: 0; font-weight: 600; font-size: 14px; color: #111;">${escapeHtml(item.name)}</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Qty: ${item.quantity} &nbsp;•&nbsp; ₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="margin: 32px 0;">
      <a href="${cartUrl}" style="background: ${PRIMARY_COLOR}; color: white; padding: 14px 28px; text-decoration: none; font-weight: 600; border-radius: 4px; display: inline-block;">Complete My Order</a>
    </div>
    <p style="font-size: 13px; color: #999;">This offer is time-sensitive — stock is limited!</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 32px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Priority Bags. All rights reserved.</p>
  </div>
`;

export const getJobApplicationTemplate = (data: {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  position: string;
  coverLetter: string;
  resumeUrl?: string;
}) => `
  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
    <h2 style="font-weight: 700; font-size: 24px; color: ${PRIMARY_COLOR}; margin-bottom: 24px;">New Job Application Received</h2>
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 8px 0;"><strong>Position:</strong> ${escapeHtml(data.position)}</p>
      <p style="margin: 8px 0;"><strong>Applicant:</strong> ${escapeHtml(data.applicantName)}</p>
      <p style="margin: 8px 0;"><strong>Email:</strong> ${escapeHtml(data.applicantEmail)}</p>
      <p style="margin: 8px 0;"><strong>Phone:</strong> ${escapeHtml(data.applicantPhone)}</p>
    </div>
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Cover Letter / Why Priority?</h3>
      <p style="font-size: 14px; line-height: 1.6; color: #333; white-space: pre-line;">${escapeHtml(data.coverLetter)}</p>
    </div>
    ${data.resumeUrl ? `
    <div style="margin: 32px 0;">
      <a href="${data.resumeUrl}" style="background: ${PRIMARY_COLOR}; color: white; padding: 14px 28px; text-decoration: none; font-weight: 600; border-radius: 4px; display: inline-block;">View Resume</a>
    </div>
    ` : '<p style="color: #666; font-style: italic;">No resume attached.</p>'}
    <hr style="border: 0; border-top: 1px solid #eee; margin: 32px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Priority Bags Recruitment. Confidential.</p>
  </div>
`;

export const getCorporateInquiryEmailTemplate = (data: {
  referenceNumber: string;
  name: string;
  phone: string;
  organisationName: string;
  email: string;
  quantity: string;
  location: string;
  approxBudget: string;
  category: string;
  notes?: string;
}) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 0; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
    <div style="background-color: #0F1417; color: #ffffff; padding: 28px 32px; border-bottom: 3px solid #F69245;">
      <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: #F69245; font-weight: 700;">Priority Bags &bull; Corporate Desk</p>
      <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 800; letter-spacing: -0.01em;">New Corporate Gifting Requirement</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #bbbbbb;">Reference: <strong style="color: #ffffff;">#${escapeHtml(data.referenceNumber)}</strong></p>
    </div>

    <div style="padding: 32px;">
      <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.12em; color: #666; margin: 0 0 16px 0; border-bottom: 1px solid #eee; padding-bottom: 8px;">
        1. Client &amp; Organization Information
      </h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tr>
          <td style="padding: 10px 12px; background: #fafafa; border: 1px solid #eeeeee; width: 35%; font-weight: 600; color: #444;">Name</td>
          <td style="padding: 10px 12px; border: 1px solid #eeeeee; color: #111; font-weight: bold;">${escapeHtml(data.name)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; background: #fafafa; border: 1px solid #eeeeee; font-weight: 600; color: #444;">Mobile Number</td>
          <td style="padding: 10px 12px; border: 1px solid #eeeeee; color: #111;">
            <a href="tel:${escapeHtml(data.phone)}" style="color: #0066cc; text-decoration: none; font-weight: 600;">${escapeHtml(data.phone)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; background: #fafafa; border: 1px solid #eeeeee; font-weight: 600; color: #444;">Organisation Name</td>
          <td style="padding: 10px 12px; border: 1px solid #eeeeee; color: #111; font-weight: 600;">${escapeHtml(data.organisationName)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; background: #fafafa; border: 1px solid #eeeeee; font-weight: 600; color: #444;">Official Mail ID</td>
          <td style="padding: 10px 12px; border: 1px solid #eeeeee; color: #111;">
            <a href="mailto:${escapeHtml(data.email)}" style="color: #0066cc; text-decoration: none;">${escapeHtml(data.email)}</a>
          </td>
        </tr>
      </table>

      <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.12em; color: #666; margin: 28px 0 16px 0; border-bottom: 1px solid #eee; padding-bottom: 8px;">
        2. Requirement Specifications
      </h2>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tr>
          <td style="padding: 10px 12px; background: #fafafa; border: 1px solid #eeeeee; width: 35%; font-weight: 600; color: #444;">Category</td>
          <td style="padding: 10px 12px; border: 1px solid #eeeeee; color: #111; font-weight: bold; color: #F69245;">${escapeHtml(data.category)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; background: #fafafa; border: 1px solid #eeeeee; font-weight: 600; color: #444;">Quantity</td>
          <td style="padding: 10px 12px; border: 1px solid #eeeeee; color: #111; font-weight: bold;">${escapeHtml(data.quantity)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; background: #fafafa; border: 1px solid #eeeeee; font-weight: 600; color: #444;">Approx. Budget</td>
          <td style="padding: 10px 12px; border: 1px solid #eeeeee; color: #111;">${escapeHtml(data.approxBudget)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; background: #fafafa; border: 1px solid #eeeeee; font-weight: 600; color: #444;">Delivery Location</td>
          <td style="padding: 10px 12px; border: 1px solid #eeeeee; color: #111;">${escapeHtml(data.location)}</td>
        </tr>
        ${data.notes ? `
        <tr>
          <td style="padding: 10px 12px; background: #fafafa; border: 1px solid #eeeeee; font-weight: 600; color: #444;">Remarks &amp; Branding Details</td>
          <td style="padding: 10px 12px; border: 1px solid #eeeeee; color: #333; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(data.notes)}</td>
        </tr>
        ` : ''}
      </table>

      <div style="background-color: #f6f8fa; border-left: 4px solid #F69245; padding: 14px 18px; border-radius: 4px; margin-top: 24px;">
        <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.4;">
          This inquiry has been saved to the database. Reply directly to <a href="mailto:${escapeHtml(data.email)}" style="color: #000; font-weight: 600;">${escapeHtml(data.email)}</a> to provide customized catalog and quotation.
        </p>
      </div>
    </div>

    <div style="background-color: #fafafa; border-top: 1px solid #eeeeee; padding: 16px 32px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #999;">Priority Bags &bull; High Spirit Commercial Ventures Pvt Ltd &bull; Confidential</p>
    </div>
  </div>
`;

export const getCorporateInquiryAckTemplate = (name: string, referenceNumber: string, organisationName: string) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="font-weight: 700; font-size: 22px; color: #0F1417; margin-top: 0;">Thank You for Your Corporate Inquiry</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #333;">Hi ${escapeHtml(name)},</p>
    <p style="font-size: 15px; line-height: 1.6; color: #333;">
      We have received your corporate gifting &amp; bulk order inquiry for <strong>${escapeHtml(organisationName)}</strong>.
    </p>
    <div style="background: #f9f9f9; padding: 16px 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #F69245;">
      <p style="margin: 0; font-size: 13px; color: #666; font-weight: 600; text-transform: uppercase;">Inquiry Reference</p>
      <p style="margin: 4px 0 0; font-size: 18px; color: #111; font-weight: 700; font-family: monospace;">${escapeHtml(referenceNumber)}</p>
    </div>
    <p style="font-size: 14px; line-height: 1.6; color: #555;">
      Our Head of Institutional Accounts (Ayyappan KP) will review your specifications and share a customized product proposal, physical sample timeline, and volume pricing with you shortly.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #555;">
      For urgent inquiries, you may directly reach out to us at <a href="mailto:ayyappan.kp@hscvpl.com" style="color: #000; font-weight: 600;">ayyappan.kp@hscvpl.com</a>.
    </p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Priority Bags &bull; High Spirit Commercial Ventures Pvt Ltd.</p>
  </div>
`;

