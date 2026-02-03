
/**
 * StudentPocket - Archon Administrative Relay System
 * Architect: Sushil Pokhrel
 */
import { ADMIN_EMAIL } from '../constants';

export type DispatchType = 
    | 'OTP_REQUEST' 
    | 'VERIFY_REQUEST' 
    | 'VERIFIED_NOTICE' 
    | 'BAN_NOTICE' 
    | 'TERMINATION_NOTICE' 
    | 'DELETION_NOTICE' 
    | 'SYSTEM_UPDATE';

export const emailService = {
    /**
     * Prepares institutional dispatches for the Administrator.
     * All 'mailto' links are addressed exclusively to pokharelsushil242@gmail.com.
     */
    async sendInstitutionalMail(
        targetUserEmail: string, 
        payload: string, 
        type: DispatchType = 'OTP_REQUEST', 
        username: string = 'Unknown Node'
    ): Promise<void> {
        let subjectText = "";
        let bodyText = "";
        const upperUser = username.toUpperCase();
        
        // As per instructions: The recipient is ONLY the admin's email.
        const recipient = ADMIN_EMAIL;

        // Core Greeting Header
        const greeting = `INSTITUTIONAL DISPATCH PROTOCOL\n\nDear user ${upperUser},\n\n`;
        const footer = `\n\nAuthorized Archive: pokharelsushil242@gmail.com\n--- End of Dispatch ---`;

        switch (type) {
            case 'OTP_REQUEST':
                subjectText = `ACCESS TOKEN REQUEST: Authentication Node - ${upperUser}`;
                bodyText = greeting +
                    `A two-factor authentication sequence has been generated for your session.\n\n` +
                    `VERIFICATION OTP: ${payload}\n\n` +
                    `Please enter this sequence into your terminal to authorize access.` +
                    footer;
                break;

            case 'VERIFY_REQUEST':
                subjectText = `IDENTITY AUDIT: Intake Submission - ${upperUser}`;
                bodyText = `ADMIN ACTION REQUIRED\n\n` +
                    `The following node has submitted an identity intake form for verification:\n` +
                    `USERNAME: ${upperUser}\n` +
                    `CONTACT NODE: ${targetUserEmail}\n\n` +
                    `VERIFICATION TOKEN: ${payload}\n` +
                    `AUDIT LINK: ${window.location.origin}/?v=${payload}\n\n` +
                    `Composition required by Master Node.` +
                    footer;
                break;

            case 'VERIFIED_NOTICE':
                subjectText = `CLEARANCE GRANTED: Node Verified - ${upperUser}`;
                bodyText = greeting +
                    `Your identity node has been successfully verified by the Master Architect.\n\n` +
                    `STATUS: ACTIVE / PLATINUM\n` +
                    `Your communication node ${targetUserEmail} is now fully synchronized.` +
                    footer;
                break;

            case 'BAN_NOTICE':
                subjectText = `PROTOCOL VIOLATION: Node Banned - ${upperUser}`;
                bodyText = greeting +
                    `Your access to the StudentPocket mesh has been restricted due to a protocol violation.\n\n` +
                    `REASON: ${payload}\n` +
                    `STATUS: BANNED` +
                    footer;
                break;

            case 'TERMINATION_NOTICE':
                subjectText = `CRITICAL FAILURE: Node Terminated - ${upperUser}`;
                bodyText = greeting +
                    `A critical security infraction has been detected. Your identity node has been terminated.\n\n` +
                    `ACTION: SYSTEM PURGE\n` +
                    `REASON: ${payload}` +
                    footer;
                break;

            case 'DELETION_NOTICE':
                subjectText = `REGISTRY CLEANUP: Node Deleted - ${upperUser}`;
                bodyText = greeting +
                    `Your identity node and all associated data segments have been permanently deleted from the central registry.\n\n` +
                    `CONFIRMATION: ${payload}` +
                    footer;
                break;

            case 'SYSTEM_UPDATE':
                subjectText = `SYSTEM ANNOUNCEMENT: Mesh Update - ${upperUser}`;
                bodyText = greeting +
                    `The Master Architect has released a new system update for the StudentPocket infrastructure.\n\n` +
                    `DETAILS: ${payload}` +
                    footer;
                break;
        }

        const subject = encodeURIComponent(subjectText);
        const body = encodeURIComponent(bodyText);
        const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;
        
        window.location.href = mailtoLink;
    }
};
