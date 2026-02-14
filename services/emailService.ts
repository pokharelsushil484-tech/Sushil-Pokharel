
import { ADMIN_EMAIL, ADMIN_PHONE, SYSTEM_DOMAIN, APP_NAME, APP_VERSION } from '../constants';

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

        const letterhead = `${APP_NAME} | ${APP_VERSION}\nLOCATION: ${SYSTEM_DOMAIN}\nIDENTITY STATUS: OFFICIAL LOG\n------------------------------------------------\nINSTITUTIONAL COMMUNICATION DISPATCH\n\n`;
        const dateLine = `DISPATCH TIMESTAMP: ${date}\n\n`;

        switch (type) {
            case 'RECOVERY_ACTIVATED':
                subjectText = `RECOVERY STATUS: ACTIVATED`;
                letterBody = `DEAR USER,\n\n` +
                    `YOUR RECOVERY LINK HAS BEEN ACTIVATED. YOU HAVE SUCCESSFULLY ACTIVATED.\n\n` +
                    `YOUR ACCESS TO THE PLATINUM SUPREME MESH HAS BEEN RESTORED BY SUSHIL POKHAREL.\n\n` +
                    `REGARDS,\n${APP_NAME} ADMINISTRATION`;
                break;

            case 'RECOVERY_REJECTED':
                subjectText = `RECOVERY STATUS: REJECTED`;
                letterBody = `DEAR USER,\n\n` +
                    `YOUR EMAIL HAS BEEN REJECTED.\n\n` +
                    `THE RECOVERY REQUEST FOR NODE ${upperUser} FAILED THE SUPREME INSTITUTIONAL AUDIT PROTOCOL.\n\n` +
                    `REGARDS,\n${APP_NAME} SECURITY`;
                break;

            case 'PASSWORD_RECOVERY_LINK':
                subjectText = `SECURITY PROTOCOL: IDENTITY KEY RECOVERY`;
                letterBody = `DEAR PERSONNEL ${upperUser},\n\n` +
                    `A PASSWORD RECOVERY REQUEST HAS BEEN INITIALIZED FOR YOUR IDENTITY KEY.\n\n` +
                    `SECURE RECOVERY PORTAL:\n${window.location.origin}/?recovery=${payload}\n\n` +
                    `FOLLOW THE LINK TO RE-SYNCHRONIZE YOUR NODE.\n\n` +
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
                    `A FORMAL REQUEST FOR BIOMETRIC VERIFICATION HAS BEEN SUBMITTED BY PERSONNEL: ${upperUser}.\n\n` +
                    `AUDIT PORTAL: ${window.location.origin}/?v=${payload}`;
                break;

            case 'RECOVERY_REQUEST':
                subjectText = `ACCESS RESTORATION APPEAL: ${upperUser}`;
                letterBody = `DEAR SUSHIL POKHAREL,\n\n` +
                    `A TERMINATED NODE (${upperUser}) HAS FILED A FORMAL RECOVERY APPEAL.\n\n` +
                    `SLACK RECOVERY KEY: ${payload}\n\n` +
                    `REVIEW APPEAL: ${window.location.origin}/?recovery=${payload}`;
                break;

            case 'TFA_CONFIRMATION':
                subjectText = `IDENTITY AUTHORIZED: ${upperUser}`;
                letterBody = `DEAR ${upperUser},\n\n` +
                    `YOUR IDENTITY NODE HAS BEEN AUTHORIZED FOR SUPREME ACCESS.\n\n` +
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
