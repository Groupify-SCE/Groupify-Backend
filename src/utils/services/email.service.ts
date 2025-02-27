import { JwtPayload } from 'jsonwebtoken';
import { createTransport } from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';
import jwtService from './jwt.service';

interface ResetPasswordPayload extends JwtPayload {
  type: 'reset_password';
  user_id: string;
}

class EmailManager {
  private static instance: EmailManager;

  private transporter = createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  private constructor() {}

  public static getInstance(): EmailManager {
    if (!EmailManager.instance) {
      EmailManager.instance = new EmailManager();
    }
    return EmailManager.instance;
  }

  private async sendMail(
    participants: string[],
    subject: string,
    content: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: participants,
        subject: '[Groupify] ' + subject,
        html: content,
      };
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (err) {
      console.error('Error sending email:', err);
    }
    return false;
  }

  private generateToken(user_id: string): string | null {
    try {
      const payload: ResetPasswordPayload = {
        type: 'reset_password',
        user_id: user_id,
      };
      return jwtService.generateToken(payload, '1h');
    } catch (err) {
      console.error('Error generating token:', err);
    }
    return null;
  }

  public async generateResetPasswordEmail(
    user_id: string,
    email: string,
    name: string
  ): Promise<boolean> {
    try {
      const token = this.generateToken(user_id);

      const templatePath = path.join(__dirname, '../emails/resetPassword.ejs');

      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const htmlContent = ejs.render(templateContent, { token, name });

      return await this.sendMail(
        [email],
        'Reset Password Request',
        htmlContent
      );
    } catch (err) {
      console.error('Error generating reset password email:', err);
    }
    return false;
  }
}

export const emailManager = EmailManager.getInstance();

export default emailManager;
