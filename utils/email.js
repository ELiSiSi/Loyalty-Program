import nodemailer from 'nodemailer';
import { htmlToText } from 'html-to-text';

export class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name.split(' ')[0];
    this.url = url;
  }

  newTransport() {
    const username = process.env.MY_EMAIL_USERNAME;
    const password = process.env.MY_EMAIL_PASSWORD;

    console.log('DEBUG EMAIL CREDENTIALS:', {
      username,
      hasPassword: !!password,
    });

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: username,
        pass: password,
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

    const info = await this.newTransport().sendMail(mailOptions);
    console.log('Email sent successfully! MessageID:', info.messageId);
  }

  generateHtml(template) {
    if (template === 'welcome' || template === 'welcomeAdmin') {
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
