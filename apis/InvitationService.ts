import { InvitationStatus } from "@/components/constants/enums";
import { BaseService } from ".";
import EmailService from "./EmailService";

class InvitationService extends BaseService {
    constructor() {
        super("invitations");
    }

    async createInvitation(senderId: string, senderEmail:string, teamId: string, teamName: string, receiverEmail: string) {
        const registered_user = await this.getByFilters([
            {
                a: 'email',
                b: '==',
                c: receiverEmail
            }
        ]);

        if (registered_user.length == 1 && !registered_user[0].invite_optin) {
            //User is Opt-out
            return null
        }

        const newInvitation = {
            invite_date: new Date(),
            invitation_status: InvitationStatus.Pending,
            receiver_email: receiverEmail,
            response_date: null as any,
            sender_id: senderId,
            team_id: teamId
        }
        await EmailService.sendEmail(senderEmail, receiverEmail, teamName);
        return await this.create(newInvitation)
    }

    async getPendingReceivedInvitations(email:string) {
        const invitations = await this.getByFilters([
            {
                a: 'receiver_email',
                b: '==',
                c: email
            },
            {
                a: 'invitation_status',
                b: '==',
                c: InvitationStatus.Pending
            }
        ])
        return invitations
    }

    async getSentInvitations(userId: string) {
        const invitations = await this.getByFilters([
            {
                a: 'sender_id',
                b: '==',
                c: userId
            }
        ])
        return invitations
    }

    async getTeamSentInvitations(userId: string, teamId: string) {
        const invitations = await this.getByFilters([
            {
                a: 'sender_id',
                b: '==',
                c: userId
            },
            {
                a: 'team_id',
                b: '==',
                c: teamId
            }
        ])
        return invitations
    }

    async updateInvitation(invitationId: string, invitation_status: InvitationStatus) {
        return await this.update(invitationId, {
            invitation_status: invitation_status,
            response_date: new Date()
        })
    }
}

export default new InvitationService();
