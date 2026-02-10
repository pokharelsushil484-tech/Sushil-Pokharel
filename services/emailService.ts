
/**
 * StudentPocket - Supreme Institutional Dispatch Protocol
 * Lead Architect: Sushil Pokharel
 */
import { ADMIN_EMAIL, CREATOR_NAME, ADMIN_PHONE, SYSTEM_DOMAIN } from '../constants';

export type DispatchType = 
    | 'OTP_REQUEST' 
    | 'VERIFY_REQUEST' 
    | 'VERIFIED_NOTICE' 
    | 'BAN_NOTICE' 
    | 'RESTORE_NOTICE'
    | 'RECOVERY_REQUEST'
    | 'SYSTEM_UPDATE'
    | 'TERMINATION_NOTICE'
    | 'DELETION_NOTICE'
    | 'TFA_CONFIRMATION';

export const emailService = {
    /**
     * Composes a formal institutional letter for supreme communication.
     */
    async sendInstitutionalMail(
        targetUserEmail: string, 
        payload: string, 
        type: DispatchType = 'OTP_REQUEST', 
        username: string = 'Unknown User'
    ): Promise<void> {
        const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const upperUser = username.toUpperCase();
        
        let subjectText = "";
        let letterBody = "";

        // Supreme Institutional Letterhead
        const letterhead = `STUDENTPOCKET INSTITUTIONAL REGISTRY\nLOCATION: ${SYSTEM_DOMAIN}\nARCHITECT CONTACT: ${ADMIN_PHONE}\n------------------------------------------------\nOFFICIAL COMMUNICATION LOG\n\n`;
        const adminHeader = `TO: SUSHIL POKHAREL\nLEAD ARCHITECT OFFICE\nREGISTRY: ${ADMIN_EMAIL}\n\n`;
        const dateLine = `DATE: ${date}\n\n`;

        switch (type) {
            case 'TFA_CONFIRMATION':
                subjectText = `TFA Verification Successful - ${SYSTEM_DOMAIN}`;
                letterBody = `Dear User,\n\n` +
                    `This email is to confirm that the Two-Factor Authentication (TFA) code for the domain ${SYSTEM_DOMAIN} has been successfully verified by the administrator.\n\n` +
                    `TFA Code: ${payload}\n\n` +
                    `If you face any issues or require further assistance, please contact the system administration team.\n\n` +
                    `Best regards,\nAdministrator\nSystem Support Team`;
                break;

            case 'OTP_REQUEST':
                subjectText = `Authorization Request: Security Token Node - ${upperUser}`;
                letterBody = `Dear Sushil Pokharel,\n\n` +
                    `An identity synchronization token has been requested for node: ${upperUser}.\n\n` +
                    `System Sequence generated:\n` +
                    `TOKEN: ${payload}\n\n` +
                    `Ensure this token is validated against node: ${targetUserEmail}.\n\n` +
                    `Regards,\nInstitutional Security Relay`;
                break;

            case 'VERIFY_REQUEST':
                subjectText = `Institutional Audit: Identity Verification Submission - ${upperUser}`;
                letterBody = `Dear Sushil Pokharel,\n\n` +
                    `A formal request for biometric node verification has been submitted by: ${upperUser}.\n\n` +
                    `The audit portal is ready for your review:\n` +
                    `AUDIT PORTAL: ${window.location.origin}/?v=${payload}\n\n` +
                    `Sincerely,\nInstitutional Intake Office`;
                break;

            case 'RECOVERY_REQUEST':
                subjectText = `Access Restoration Appeal: Node ${upperUser}`;
                letterBody = `Dear Sushil Pokharel,\n\n` +
                    `A terminated identity node (${upperUser}) has filed a reactive appeal for access restoration.\n\n` +
                    `Protocol review required. Perform master override via the link below if appropriate:\n` +
                    `RECOVERY LINK: ${window.location.origin}/?recovery=${payload}\n\n` +
                    `Respectfully,\nGuardian Core Registry`;
                break;

            case 'TERMINATION_NOTICE':
                subjectText = `Security Notice: Automated Node Termination - ${upperUser}`;
                letterBody = `Dear Sushil Pokharel,\n\n` +
                    `Linguistic threat detection has triggered an automated purge of node: ${upperUser}.\n\n` +
                    `Reason for Termination: ${payload}\n\n` +
                    `The node is now locked awaiting Supreme Architect review.\n\n` +
                    `Guardian Core Automaton,\nStudentPocket Mesh`;
                break;

            case 'VERIFIED_NOTICE':
                subjectText = `Formal Notification: Verification Clearance Status`;
                letterBody = `Dear ${upperUser},\n\n` +
                    `On behalf of Lead Architect Sushil Pokharel, your identity node has been granted Full Clearance.\n\n` +
                    `Your data fortress is now synchronized.\n\n` +
                    `Administration,\nStudentPocket Registry`;
                break;

            default:
                subjectText = `Institutional Protocol Update`;
                letterBody = `Message Payload:\n${payload}`;
        }

        const fullContent = (type === 'TFA_CONFIRMATION') ? letterBody : letterhead + adminHeader + dateLine + letterBody;
        const mailtoLink = `mailto:${targetUserEmail}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(fullContent)}`;
        
        window.location.href = mailtoLink;
    }
};
