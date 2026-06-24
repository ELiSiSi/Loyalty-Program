import nodemailer from 'nodemailer';
import { htmlToText } from 'html-to-text';

export class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name.split(' ')[0];
    this.url = url;
    this.from = `<${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // شيلنا شرط الـ production مؤقتاً للتجربة
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MY_EMAIL_USERNAME,
        pass: process.env.MY_EMAIL_PASSWORD, // الباسورد المكون من 16 حرف المكتوب في الـ .env
      },
    });
  }

  async send(template, subject) {
    const html = this.generateHtml(template);

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  generateHtml(template) {
    if (template === 'welcome') {
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

    return `<p>Hello ${this.name}</p>`;
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Rehletna Family!');
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
