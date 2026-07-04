/**
 * Email sender (nodemailer). If SMTP isn't configured we log the email to the
 * console instead of failing — keeps local dev friction-free.
 */
import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

const transporter =
  env.SMTP_HOST && env.SMTP_USER
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      })
    : null;

export async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter) {
    logger.info({ to, subject }, '📧 [DEV] Email (SMTP not configured, logging only)');
    logger.debug(html);
    return;
  }
  await transporter.sendMail({ from: env.MAIL_FROM, to, subject, html });
}

export function otpEmailTemplate(name: string, code: string, purpose: string) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto">
    <h2 style="color:#0f172a">SkillForge</h2>
    <p>Hi ${name},</p>
    <p>Your ${purpose} code is:</p>
    <p style="font-size:28px;font-weight:800;letter-spacing:6px;color:#f97316">${code}</p>
    <p style="color:#64748b">This code expires in 10 minutes.</p>
    <hr/>
    <p style="color:#94a3b8;font-size:12px">Turn Skills Into Successful Businesses.</p>
  </div>`;
}
