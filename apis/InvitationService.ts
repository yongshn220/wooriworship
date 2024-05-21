import { InvitationStatus } from "@/components/constants/enums";
import { BaseService } from ".";

class InvitationService extends BaseService {
    constructor() {
        super("worships");
    }

    async createInvitation(senderId: string, teamId: string, receiverEmail: string) {
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

    async updateInvitation(invitationId: string, invitation_status: InvitationStatus) {
        return await this.update(invitationId, {
            invitation_status: invitation_status,
            response_date: new Date()
        })
    }
}

export default new InvitationService();
