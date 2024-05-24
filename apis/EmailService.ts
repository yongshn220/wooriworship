import { EmailJsConst } from '@/components/constants/constants';
import emailjs from 'emailjs-com';

class EmailService {

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
            title: `[Woori Worship] You have been Invited`,
            body: `<p>Hi ${receiverEmail}, </p>
            <br>
            <p>${senderEmail} invited you to join ${teamName}!</p>
            <br>
            <p>You can go to wooriworship.com to view the invitation</p>`
        }
    }
}

export default new EmailService();