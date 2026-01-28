import { EmailJsConst } from '@/components/constants/constants';
import emailjs from 'emailjs-com';

class EmailApi {

    async sendEmail(senderEmail: string, receiverEmail: string, teamName: string) {
        const emailContent = this.formateCommentEmail(senderEmail, receiverEmail, teamName)
        await emailjs.send(EmailJsConst.serviceId, EmailJsConst.templateId, {
            to: receiverEmail,
            title: emailContent.title,
            message: emailContent.body
        }, EmailJsConst.userId);
    }

    formateCommentEmail(senderEmail: string, receiverEmail: string, teamName: string) {
        return {
            title: `[Woori Worship] Invitation to Join ${teamName}`,
            body: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h1 style="font-size: 24px; color: #4CAF50; text-align: center;">
                        Invitation to Join <strong>${teamName}</strong>
                    </h1>
                    <p style="font-size: 16px; text-align: center; margin-top: -10px;">
                        From <strong>${senderEmail}</strong>
                    </p>
                    <br>
                    <p>Hi ${receiverEmail},</p>
                    <p>We are excited to let you know that you’ve been invited to join the team 
                    <strong>${teamName}</strong> on <strong>Woori Worship</strong>.</p>
                    <p>Here’s what you need to do to accept the invitation:</p>
                    <ol style="font-size: 16px; margin-left: 20px;">
                        <li>Visit our website: 
                            <a href="https://wooriworship.com" target="_blank" style="color: #4CAF50; text-decoration: none;">
                                wooriworship.com
                            </a>
                        </li>
                        <li>Log in to your Woori Worship account. If you don’t have one, sign up for free.</li>
                        <li>Go to the <strong>Manage</strong> section on your dashboard.</li>
                        <li>Click on <strong>Invitation Inbox</strong>.</li>
                        <li>Locate the invitation and click <strong>Accept</strong>.</li>
                    </ol>
                    <br>
                    <p style="font-size: 14px; color: #666;">If you have any questions or need assistance, feel free to contact us at 
                    <a href="mailto:wooriworship110@gmail.com" style="color: #4CAF50; text-decoration: none;">
                        wooriworship110@gmail.com
                    </a>.</p>
                    <br>
                    <p>We look forward to seeing you in the team!</p>
                    <br>
                    <p style="font-size: 16px; text-align: center; color: #4CAF50;">
                        <strong>The Woori Worship Team</strong>
                    </p>
                </div>
            `
        };
    }
    
}

export default new EmailApi();