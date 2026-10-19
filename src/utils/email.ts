import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // If test or no credentials provided, log email instead of throwing
  if (env.NODE_ENV === 'test' || !env.MY_EMAIL_USERNAME) {
    console.log(`📧 [Mock Email] To: ${options.email} | Subject: ${options.subject}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465,
      auth: {
        user: env.MY_EMAIL_USERNAME,
        pass: env.MY_EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Loyalty Platform" <${env.MY_EMAIL_USERNAME}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ [Email Service Error]:', error);
  }
};
