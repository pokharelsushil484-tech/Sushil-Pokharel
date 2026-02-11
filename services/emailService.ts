
import { ADMIN_EMAIL, ADMIN_PHONE, SYSTEM_DOMAIN } from '../constants';

export type DispatchType = 
    | 'OTP_REQUEST' 
    | 'VERIFY_REQUEST' 
    | 'VERIFIED_NOTICE' 
    | 'BAN_NOTICE' 
    | 'RESTORE_NOTICE'
    | 'RECOVERY_REQUEST'
    | 'RECOVERY_ACTIVATED'
    | 'RECOVERY_REJECTED'
    | 'SYSTEM_UPDATE'
    | 'TERMINATION_NOTICE'
    | 'TFA_CONFIRMATION';

export const emailService = {
    async sendInstitutionalMail(
        targetUserEmail: string, 
        payload: string, 
        type: DispatchType = 'OTP_REQUEST', 
        username: string = 'UNKNOWN USER'
    ): Promise<void> {
        const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
        const upperUser = username.toUpperCase();
        const targetEmail = targetUserEmail.toUpperCase();
        
        let subjectText = "";
        let letterBody = "";

        const letterhead = `STUDENTPOCKET INSTITUTIONAL REGISTRY\nLOCATION: ${SYSTEM_DOMAIN}\nARCHITECT CONTACT: ${ADMIN_PHONE}\n------------------------------------------------\nOFFICIAL COMMUNICATION LOG\n\n`;
        const adminHeader = `TO: SUSHIL POKHAREL\nLEAD ARCHITECT OFFICE\nREGISTRY: ${ADMIN_EMAIL}\n\n`;
        const dateLine = `DATE: ${date}\n\n`;

        switch (type) {
            case 'RECOVERY_ACTIVATED':
                subjectText = `RECOVERY STATUS: ACTIVATED`;
                letterBody = `DEAR USER,\n\n` +
                    `YOUR RECOVERY LINK HAS BEEN ACTIVATED. YOU HAVE SUCCESSFULLY ACTIVATED.\n\n` +
                    `YOUR ACCOUNT ACCESS HAS BEEN RESTORED BY THE SYSTEM ARCHITECT.\n\n` +
                    `REGARDS,\nSTUDENTPOCKET ADMINISTRATION`;
                break;

            case 'RECOVERY_REJECTED':
                subjectText = `RECOVERY STATUS: REJECTED`;
                letterBody = `DEAR USER,\n\n` +
                    `YOUR EMAIL HAS BEEN REJECTED.\n\n` +
                    `THE RECOVERY REQUEST FOR NODE ${upperUser} FAILED INSTITUTIONAL AUDIT.\n\n` +
                    `CONTACT THE ARCHITECT FOR MANUAL CLEARANCE.\n\n` +
                    `REGARDS,\nSTUDENTPOCKET SECURITY`;
                break;

            case 'OTP_REQUEST':
                subjectText = `AUTHORIZATION REQUEST: SECURITY TOKEN - ${upperUser}`;
                letterBody = `DEAR SUSHIL POKHAREL,\n\n` +
                    `AN IDENTITY synchronization TOKEN HAS BEEN REQUESTED FOR NODE: ${upperUser}.\n\n` +
                    `TOKEN: ${payload}\n\n` +
                    `ENSURE THIS IS VALIDATED AGAINST: ${targetEmail}.`;
                break;

            case 'VERIFY_REQUEST':
                subjectText = `INSTITUTIONAL AUDIT: IDENTITY SUBMISSION - ${upperUser}`;
                letterBody = `DEAR SUSHIL POKHAREL,\n\n` +
                    `A FORMAL REQUEST FOR BIOMETRIC VERIFICATION HAS BEEN SUBMITTED BY: ${upperUser}.\n\n` +
                    `REVIEW PORTAL: ${window.location.origin}/?v=${payload}`;
                break;

            case 'RECOVERY_REQUEST':
                subjectText = `ACCESS RESTORATION APPEAL: ${upperUser}`;
                letterBody = `DEAR SUSHIL POKHAREL,\n\n` +
                    `A TERMINATED NODE (${upperUser}) HAS FILED A RECOVERY APPEAL.\n\n` +
                    `RECOVERY KEY: ${payload}\n` +
                    `REVIEW LINK: ${window.location.origin}/?recovery=${payload}`;
                break;

            default:
                subjectText = `INSTITUTIONAL PROTOCOL UPDATE`;
                letterBody = `MESSAGE PAYLOAD: ${payload}`;
        }

        const fullContent = (type.startsWith('RECOVERY')) ? letterBody : letterhead + adminHeader + dateLine + letterBody;
        const mailtoLink = `mailto:${targetUserEmail}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(fullContent.toUpperCase())}`;
        
        window.location.href = mailtoLink;
    }
};
