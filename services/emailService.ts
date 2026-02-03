
/**
 * StudentPocket - Institutional Dispatch System
 * Architect: Sushil Pokhrel
 */
import { ADMIN_EMAIL } from '../constants';

export const emailService = {
    /**
     * Dispatches verification, auth tokens, or success notifications.
     * VERIFY type is sent TO the Admin.
     * AUTH and SUCCESS types are sent TO the User.
     */
    async sendInstitutionalMail(to: string, code: string, type: 'AUTH' | 'VERIFY' | 'SUCCESS' = 'AUTH', username: string = 'Unknown'): Promise<void> {
        let subjectText = "";
        let bodyText = "";
        let recipient = to;

        if (type === 'VERIFY') {
            // Student requesting verification FROM Admin
            recipient = ADMIN_EMAIL;
            subjectText = `AUDIT REQUIRED: Identity Verification Request - ${username}`;
            bodyText = `INSTITUTIONAL AUDIT PROTOCOL\n\n` +
                `ADMINISTRATOR ACTION REQUIRED\n\n` +
                `The following student node has submitted an identity intake form for clearance:\n\n` +
                `USERNAME: ${username}\n` +
                `STUDENT NODE EMAIL: ${to}\n` +
                `VERIFICATION TOKEN: ${code}\n\n` +
                `VERIFICATION LINK: ${window.location.origin}/?v=${code}\n\n` +
                `Please review the node details and grant clearance if valid.\n\n` +
                `--- End of Dispatch ---`;
        } else if (type === 'SUCCESS') {
            // Admin notifying Student of success
            subjectText = "StudentPocket: Institutional Node Verified Successfully";
            bodyText = `INSTITUTIONAL CLEARANCE GRANTED\n\n` +
                `Dear user ${username.toUpperCase()},\n\n` +
                `Congratulations. Your identity node has been authorized by the Master Architect.\n\n` +
                `VERIFIED EMAIL: ${to}\n\n` +
                `STATUS: ACTIVE\n` +
                `CLEARANCE LEVEL: TITANIUM\n\n` +
                `You may now access all restricted data mesh features.\n\n` +
                `--- End of Dispatch ---`;
        } else {
            // 2FA Auth token
            subjectText = "StudentPocket: Identity Access Token";
            bodyText = `INSTITUTIONAL ACCESS PROTOCOL\n\n` +
                `Dear user ${username.toUpperCase()},\n\n` +
                `To authorize your current StudentPocket session, please use the following identification token:\n\n` +
                `ACCESS TOKEN: ${code}\n\n` +
                `DO NOT SHARE THIS CODE. This is a one-time institutional sequence.\n\n` +
                `--- End of Dispatch ---`;
        }

        const subject = encodeURIComponent(subjectText);
        const body = encodeURIComponent(bodyText);
        const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;
        
        window.location.href = mailtoLink;
    }
};
