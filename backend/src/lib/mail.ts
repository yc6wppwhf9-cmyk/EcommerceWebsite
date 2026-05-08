import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465,
  auth: config.SMTP_USER && config.SMTP_PASS ? {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  } : undefined,
});

const APP_NAME = 'Priority Bags';
const PRIMARY_COLOR = '#000000'; // Sleek Black for Digital Atelier

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${config.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('❌ Email Sending Failed:', err);
  }
};

export const getVerificationTemplate = (name: string, url: string) => `
  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
    <h2 style="font-weight: 700; font-size: 24px; color: ${PRIMARY_COLOR}; margin-bottom: 24px;">Welcome to Priority Bags</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${name},</p>
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
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${name},</p>
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
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${name},</p>
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
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${name},</p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">We have received your return request for order <strong>#${orderId.slice(0,8).toUpperCase()}</strong>.</p>
    <div style="background: #f9f9f9; padding: 16px 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid ${PRIMARY_COLOR};">
      <p style="margin: 0; font-size: 13px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Your Reason</p>
      <p style="margin: 8px 0 0; font-size: 15px; color: #333; line-height: 1.5;">${reason}</p>
    </div>
    <p style="font-size: 14px; color: #666;">Our team will review your request and process it within 2–3 business days. You will receive a refund confirmation once approved.</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 32px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Priority Bags. All rights reserved.</p>
  </div>
`;

export const getReturnApprovedTemplate = (name: string, orderId: string) => `
  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
    <h2 style="font-weight: 700; font-size: 24px; color: ${PRIMARY_COLOR}; margin-bottom: 24px;">Refund Processed</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${name},</p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Your return for order <strong>#${orderId.slice(0,8).toUpperCase()}</strong> has been approved and your refund is on the way.</p>
    <p style="font-size: 14px; color: #666;">Refunds typically appear in your account within 5–7 business days depending on your bank or card issuer.</p>
    <p style="font-size: 14px; color: #666;">Thank you for shopping with Priority Bags. We hope to serve you again soon.</p>
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
      <p style="margin: 8px 0;"><strong>Position:</strong> ${data.position}</p>
      <p style="margin: 8px 0;"><strong>Applicant:</strong> ${data.applicantName}</p>
      <p style="margin: 8px 0;"><strong>Email:</strong> ${data.applicantEmail}</p>
      <p style="margin: 8px 0;"><strong>Phone:</strong> ${data.applicantPhone}</p>
    </div>
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Cover Letter / Why Priority?</h3>
      <p style="font-size: 14px; line-height: 1.6; color: #333; white-space: pre-line;">${data.coverLetter}</p>
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
