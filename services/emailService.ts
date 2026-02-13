
import { ADMIN_EMAIL, ADMIN_PHONE, SYSTEM_DOMAIN, APP_NAME } from '../constants';

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
    | 'PASSWORD_RECOVERY_LINK'
    | 'TFA_CONFIRMATION';

export const emailService = {
    async sendInstitutionalMail(
        targetUserEmail: string, 
        payload: string, 
        type: DispatchType = 'OTP_REQUEST', 
        username: string = 'UNKNOWN PERSONNEL'
    ): Promise<void> {
        const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
        const upperUser = username.toUpperCase();
        
        let subjectText = "";
        let letterBody = "";

        const letterhead = `${APP_NAME} INSTITUTIONAL REGISTRY\nLOCATION: ${SYSTEM_DOMAIN}\nSECURITY CONTACT: ${ADMIN_PHONE}\n------------------------------------------------\nOFFICIAL COMMUNICATION LOG\n\n`;
        const dateLine = `DATE: ${date}\n\n`;

        switch (type) {
            case 'RECOVERY_ACTIVATED':
                subjectText = `RECOVERY STATUS: ACTIVATED`;
                letterBody = `DEAR USER,\n\n` +
                    `YOUR RECOVERY LINK HAS BEEN ACTIVATED. YOU HAVE SUCCESSFULLY ACTIVATED.\n\n` +
                    `YOUR ACCOUNT ACCESS HAS BEEN RESTORED BY THE SYSTEM ARCHITECT SUSHIL POKHAREL.\n\n` +
                    `REGARDS,\n${APP_NAME} ADMINISTRATION`;
                break;

            case 'RECOVERY_REJECTED':
                subjectText = `RECOVERY STATUS: REJECTED`;
                letterBody = `DEAR USER,\n\n` +
                    `YOUR EMAIL HAS BEEN REJECTED.\n\n` +
                    `THE RECOVERY REQUEST FOR NODE ${upperUser} FAILED INSTITUTIONAL AUDIT.\n\n` +
                    `REGARDS,\n${APP_NAME} SECURITY`;
                break;

            case 'PASSWORD_RECOVERY_LINK':
                subjectText = `SECURITY PROTOCOL: PASSWORD RECOVERY LINK`;
                letterBody = `DEAR ${upperUser},\n\n` +
                    `A PASSWORD RECOVERY REQUEST HAS BEEN INITIALIZED FOR YOUR IDENTITY KEY.\n\n` +
                    `RECOVERY ACCESS PORTAL:\n${window.location.origin}/?recovery=${payload}\n\n` +
                    `REGARDS,\n${APP_NAME} SECURITY UNIT`;
                break;

            case 'OTP_REQUEST':
                subjectText = `AUTHORIZATION REQUEST: SECURITY TOKEN - ${upperUser}`;
                letterBody = `DEAR SUSHIL POKHAREL,\n\n` +
                    `AN IDENTITY SYNCHRONIZATION TOKEN HAS BEEN REQUESTED FOR NODE: ${upperUser}.\n\n` +
                    `TOKEN: ${payload}\n\n` +
                    `TARGET EMAIL: ${targetUserEmail.toUpperCase()}.`;
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
                    `SLACK RECOVERY KEY: ${payload}\n\n` +
                    `REVIEW LINK: ${window.location.origin}/?recovery=${payload}`;
                break;

            // Added case for TFA_CONFIRMATION to handle authorized node identity notifications
            case 'TFA_CONFIRMATION':
                subjectText = `SECURITY PROTOCOL: TFA CONFIRMATION - ${upperUser}`;
                letterBody = `DEAR ${upperUser},\n\n` +
                    `YOUR IDENTITY HAS BEEN AUTHORIZED. USE THE FOLLOWING TOKEN FOR INITIAL LOGIN:\n\n` +
                    `SECURITY TOKEN: ${payload}\n\n` +
                    `REGARDS,\n${APP_NAME} SECURITY UNIT`;
                break;

            default:
                subjectText = `INSTITUTIONAL PROTOCOL UPDATE`;
                letterBody = `MESSAGE PAYLOAD: ${payload}`;
        }

        const fullContent = letterhead + dateLine + letterBody.toUpperCase();
        const mailtoLink = `mailto:${targetUserEmail}?subject=${encodeURIComponent(subjectText.toUpperCase())}&body=${encodeURIComponent(fullContent)}`;
        
        window.location.href = mailtoLink;
    }
};
