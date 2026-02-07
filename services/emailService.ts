
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
    | 'DELETION_NOTICE';

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
        const letterhead = `STUDENTPOCKET INSTITUTIONAL REGISTRY\nDOMAIN: ${SYSTEM_DOMAIN}\nARCHITECT CONTACT: ${ADMIN_PHONE}\n------------------------------------------------\nOFFICIAL COMMUNICATION RECORD\n\n`;
        const adminHeader = `TO: SUSHIL POKHAREL\nSUPREME ADMINISTRATION OFFICE\nREGISTRY: ${ADMIN_EMAIL}\n\n`;
        const dateLine = `DATE: ${date}\n\n`;

        switch (type) {
            case 'OTP_REQUEST':
                subjectText = `Formal Authorization Request: Identity Token Node - ${upperUser}`;
                letterBody = `Dear Sushil Pokharel,\n\n` +
                    `An identity synchronization token has been requested for the user identity: ${upperUser}.\n\n` +
                    `The system has generated the following non-sequential security sequence:\n` +
                    `TOKEN: ${payload}\n\n` +
                    `Please ensure this token is verified against the communication node: ${targetUserEmail}.\n\n` +
                    `Regards,\nInstitutional Security Relay`;
                break;

            case 'VERIFY_REQUEST':
                subjectText = `Institutional Audit: Identity Verification Submission - ${upperUser}`;
                letterBody = `Dear Sushil Pokharel,\n\n` +
                    `A formal request for node verification has been submitted by: ${upperUser}.\n\n` +
                    `The biometric intake is complete. Please perform a manual audit and authorize the identity using the secure portal below:\n` +
                    `AUDIT PORTAL: ${window.location.origin}/?v=${payload}\n\n` +
                    `Sincerely,\nInstitutional Intake Office`;
                break;

            case 'RECOVERY_REQUEST':
                subjectText = `Security Appeal: Access Restoration Protocol - ${upperUser}`;
                letterBody = `Dear Sushil Pokharel,\n\n` +
                    `A terminated user identity node (${upperUser}) has filed a formal appeal for access restoration.\n\n` +
                    `The user has submitted an appeal form citing reasons for protocol violation resolution. You are required to review this request and perform a master override if the identity is deemed reactive.\n\n` +
                    `RECOVERY LINK: ${window.location.origin}/?recovery=${payload}\n\n` +
                    `Respectfully,\nSupreme Guardian Security Mesh`;
                break;

            case 'TERMINATION_NOTICE':
                subjectText = `Critical Protocol Notice: Node Termination - ${upperUser}`;
                letterBody = `Dear Sushil Pokharel,\n\n` +
                    `This is a critical system notification regarding the identity node: ${upperUser}.\n\n` +
                    `Linguistic threat detection has triggered a permanent termination of this node.\n` +
                    `Trigger Event: ${payload}\n\n` +
                    `The node has been deactivated and is awaiting your supreme review via the appeal registry.\n\n` +
                    `Automated Guardian Node,\nStudentPocket Mesh`;
                break;

            case 'VERIFIED_NOTICE':
                subjectText = `Official Notification: Institutional Verification Status`;
                letterBody = `Dear ${upperUser},\n\n` +
                    `On behalf of the Lead Architect Sushil Pokharel, we are pleased to inform you that your identity node has been verified.\n\n` +
                    `You have been granted Full Clearance. Your data mesh is now fully synchronized with the institutional registry.\n\n` +
                    `Institutional Administration,\nStudentPocket Registry`;
                break;

            default:
                subjectText = `Institutional Update: System Protocol`;
                letterBody = `Notification Payload:\n${payload}`;
        }

        const fullContent = letterhead + adminHeader + dateLine + letterBody;
        const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(fullContent)}`;
        
        window.location.href = mailtoLink;
    }
};
