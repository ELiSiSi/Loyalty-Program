import nodemailer from 'nodemailer';
import { htmlToText } from 'html-to-text';

export class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name ? user.name.split(' ')[0] : 'User';
    this.url = url;
    this.otpConfirmEmail = user.otpConfirmEmail;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MY_EMAIL_USERNAME,
          pass: process.env.MY_EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = this.generateHtml(template);

    const mailOptions = {
      from:
        process.env.MY_EMAIL_USERNAME ||
        'Rehletna Team <no-reply@rehletna.com>',
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    try {
      const info = await this.newTransport().sendMail(mailOptions);
      console.log(
        `✅ Email sent successfully using [${process.env.NODE_ENV || 'development'}] mode! MessageID:`,
        info.messageId
      );
    } catch (err) {
      console.error('❌ Error inside Email Service:', err.message);
      throw err;
    }
  }

  generateHtml(template) {
    if (template === 'welcomeAdmin') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
          <h2 style="color: #007bff;">Welcome to the Rehletna Family, ${this.name}!</h2>
          <p>We're excited to have you on board as an administrator.</p>
          <p>Please click the button below to setup your account password and get started:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.url}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Get Started / Setup Account
            </a>
          </div>
        </div>
      `;
    }

    if (template === 'welcome') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
          <h2 style="color: #28a745;">Welcome to Rehletna, ${this.name}! 🎉</h2>
          <p>Thank you for registering with us.</p>
          <p>Please use the following verification OTP code to activate your account:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; color: #333; margin: 20px 0;">
            ${this.otpConfirmEmail}
          </div>
          <p>This code is secure and will expire in <strong style="color: #dc3545;">10 minutes</strong>.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">If you didn't create this account, please ignore this email.</p>
        </div>
      `;
    }

    if (template === 'passwordReset') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
          <h2 style="color: #dc3545;">Password Reset Request</h2>
          <p>Hi ${this.name},</p>
          <p>Forgot your password? No problem. Click the button below to reset it securely.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.url}" style="display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This link is strictly valid for only <strong>10 minutes</strong>.
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
