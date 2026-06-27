import nodemailer from 'nodemailer';
import { htmlToText } from 'html-to-text';

export class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name.split(' ')[0];
    this.url = url;
    this.otpConfirmEmail = user.otpConfirmEmail;
  }

  newTransport() {
    const username = process.env.MY_EMAIL_USERNAME;
    const password = process.env.MY_EMAIL_PASSWORD;

    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: username,
        pass: password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async send(template, subject) {
    const html = this.generateHtml(template);

    const mailOptions = {
      from: process.env.MY_EMAIL_USERNAME,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    try {
      const info = await this.newTransport().sendMail(mailOptions);
      console.log('Email sent successfully! MessageID:', info.messageId);
    } catch (err) {
      console.error('Error sending email:', err);
      throw err; // rethrow عشان الـ asyncHandler يكشفها
    }
  }

  generateHtml(template) {
    if (template === 'welcomeAdmin') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to the Rehletna Family, ${this.name}!</h2>
          <p>We're excited to have you on board.</p>
          <a href="${this.url}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">
            Get Started
          </a>
        </div>
      `;
    }

    if (template === 'welcome') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Rehletna, ${this.name}! 🎉</h2>
          <p>Thank you for registering.</p>
          <p>Please use the following verification code:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px;">
            ${this.otpConfirmEmail}
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't create this account, you can ignore this email.</p>
        </div>
      `;
    }

    if (template === 'passwordReset') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${this.name},</p>
          <p>Forgot your password? Click the button below to reset it.</p>
          <a href="${this.url}" style="display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This link is valid for only 10 minutes.
          </p>
        </div>
      `;
    }

    return `<p>Hello ${this.name}</p>`;
  }

  async sendWelcome() {
    await this.send(
      'welcome',
      `Welcome to the Rehletna Family! Your OTP: ${this.otpConfirmEmail}`
    );
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }

  async sendAdminInvite() {
    await this.send(
      'welcomeAdmin',
      'You have been invited as an Admin to Rehletna!'
    );
  }
}
