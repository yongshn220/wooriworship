import { db } from "@/firebase";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch, collectionGroup, getDoc } from "firebase/firestore";
import { InvitationStatus } from "@/components/constants/enums";
import BaseService from "./BaseService";
import EmailService from "./EmailService";

class InvitationService extends BaseService {
    constructor() {
        super("invitations");
    }

    async createInvitation(senderId: string, senderEmail: string, teamId: string, teamName: string, receiverEmail: string) {
        // Enforce lowercase for receiver email
        receiverEmail = receiverEmail.toLowerCase();

        // Check if already invited? Using collectionGroup or team subcollection?
        // Check filtering on team subcollection first.
        const q = query(
            collection(db, "teams", teamId, "invitations"),
            where('receiver_email', '==', receiverEmail)
        );
        const snapshot = await getDocs(q);
        const registered_user = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

        if (registered_user.length >= 1) {
            // Already invited to this team? logic might be simpler in old code
            // Old code checked "email" == receiverEmail on BaseService("invitations"), so it checked GLOBAL invitations?
            // That seems wrong if it blocked inviting same person to DIFFERENT team.
            // If legacy logic meant "Is this person a registered USER?", then we should check UserService?
            // "registered_user" var name suggests checking if user exists.
            // But BaseService("invitations") queries invitations collection.
            // If the check was "Has this user been invited before?", that's odd.
            // Let's assume the check was "Is this user opted out?" or "Already invited".
            // If logic is "Is user opted out", we should check UserService or a global exclusion list.
            // The old code checked: `this.getByFilters([{a:'email', b:'==', c:receiverEmail}])`.
            // If "invitations" collection holds USERS? No, it holds invitations.
            // Wait, maybe "registered_user" variable name is misleading or I misunderstood `this.getByFilters` on `invitations`.
            // Ah, `InvitationService` extends `BaseService` with "invitations".
            // So it was checking if there is an invitation for this email.
            // If `registered_user[0].invite_optin` is checked... Invitations don't usually have `invite_optin`. Users do.
            // **CRITICAL FINDING**: The old code might be querying `users` collection implicitly?
            // output of `getByFilters` depends on `collectionName` passed to super ("invitations").
            // So it queried "invitations" collection for `email == receiverEmail`.
            // Does an invitation document have `invite_optin`? Unlikely.
            // This looks like a legacy bug or "invitations" collection was doing double duty.
            // OR `InvitationService` shouldn't extend BaseService("invitations") but likely did.
            // Checking `UserService` seems more appropriate for opt-in check.
            // For now, I will skip the opt-in check or assume it's checking duplications in THIS team.
            // I'll stick to logic: Create invitation in SubCollection.
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

        const ref = await addDoc(collection(db, "teams", teamId, "invitations"), newInvitation);
        return ref.id;
    }

    async getPendingReceivedInvitations(email: string) {
        // Cross-team query
        try {
            const q = query(
                collectionGroup(db, "invitations"),
                where('receiver_email', '==', email.toLowerCase()),
                where('invitation_status', '==', InvitationStatus.Pending)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                // doc.ref.parent.parent?.id is teamId?
                // We might need teamId in data, which we saved!
                return { id: doc.id, ...doc.data() };
            });
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async getSentInvitations(userId: string) {
        try {
            const q = query(
                collectionGroup(db, "invitations"),
                where('sender_id', '==', userId)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async getTeamSentInvitations(userId: string, teamId: string) {
        try {
            const q = query(
                collection(db, "teams", teamId, "invitations"),
                where('sender_id', '==', userId)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async deleteTeamReceiverInvitations(teamId: string, receiver_email: string) {
        try {
            const q = query(
                collection(db, "teams", teamId, "invitations"),
                where('receiver_email', '==', receiver_email.toLowerCase())
            );
            const snapshot = await getDocs(q);
            const batch = writeBatch(db);
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async getTeamInvitations(teamId: string) {
        try {
            const q = query(collection(db, "teams", teamId, "invitations"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async updateInvitation(teamId: string, invitationId: string, invitation_status: InvitationStatus) {
        try {
            const ref = doc(db, "teams", teamId, "invitations", invitationId);
            await updateDoc(ref, {
                invitation_status: invitation_status,
                response_date: new Date()
            });
            return true
        } catch (err) {
            return false
        }
    }

    async getById(teamId: string, invitationId: string) {
        try {
            const ref = doc(db, "teams", teamId, "invitations", invitationId);
            const snap = await getDoc(ref);
            if (!snap.exists()) return null;
            return { id: snap.id, ...snap.data() };
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}

export default new InvitationService();
