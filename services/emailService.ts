
/**
 * StudentPocket - Archon Identity Dispatch System
 * Architect: Sushil Pokhrel
 */
import { ADMIN_EMAIL } from '../constants';

export const emailService = {
    /**
     * Dispatches verification, auth tokens, or success notifications.
     * VERIFY and AUTH (Request) types are sent TO the Admin for processing.
     * SUCCESS notifications are composed for the User.
     */
    async sendInstitutionalMail(to: string, code: string, type: 'AUTH' | 'VERIFY' | 'SUCCESS' = 'AUTH', username: string = 'Unknown'): Promise<void> {
        let subjectText = "";
        let bodyText = "";
        let recipient = to;
        
        const upperUser = username.toUpperCase();

        if (type === 'VERIFY') {
            // Student requesting verification FROM Admin
            recipient = ADMIN_EMAIL;
            subjectText = `AUDIT REQUIRED: Node Verification Request - ${upperUser}`;
            bodyText = `INSTITUTIONAL AUDIT PROTOCOL\n\n` +
                `ADMINISTRATOR ACTION REQUIRED\n\n` +
                `Identity Intake Submission for:\n` +
                `USERNAME: ${upperUser}\n` +
                `CONTACT: ${to}\n\n` +
                `VERIFICATION TOKEN: ${code}\n` +
                `AUDIT LINK: ${window.location.origin}/?v=${code}\n\n` +
                `Please authenticate via the Master Node to grant clearance.\n\n` +
                `--- End of Dispatch ---`;
        } else if (type === 'SUCCESS') {
            // Admin notifying Student of success
            subjectText = `CLEARANCE GRANTED: Institutional Node Verified - ${upperUser}`;
            bodyText = `INSTITUTIONAL CLEARANCE NOTIFICATION\n\n` +
                `Dear user ${upperUser},\n\n` +
                `Your identity node has been authorized by the Master Architect (poojalsushil2424@gmail.com).\n\n` +
                `STATUS: ACTIVE\n` +
                `LEVEL: TITANIUM\n\n` +
                `Your StudentPocket environment is now fully synchronized.\n\n` +
                `--- End of Dispatch ---`;
        } else {
            // 2FA Auth token - Request sent TO Admin or User depending on local node state
            // As per instruction: "The 'mail to' recipient is only the admin's email" for requests.
            recipient = ADMIN_EMAIL;
            subjectText = `SECURITY TOKEN REQUEST: Access Authorization - ${upperUser}`;
            bodyText = `INSTITUTIONAL ACCESS PROTOCOL\n\n` +
                `Dear user ${upperUser},\n\n` +
                `A security access token has been generated for your node session.\n\n` +
                `ACCESS TOKEN: ${code}\n\n` +
                `Admin Authorization: poojalsushil2424@gmail.com\n\n` +
                `--- End of Dispatch ---`;
        }

        const subject = encodeURIComponent(subjectText);
        const body = encodeURIComponent(bodyText);
        const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;
        
        window.location.href = mailtoLink;
    }
};
