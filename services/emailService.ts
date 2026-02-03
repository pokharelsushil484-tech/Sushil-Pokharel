
/**
 * StudentPocket - Institutional Dispatch System
 * Architect: Sushil Pokhrel
 */

export interface EmailPayload {
    to: string;
    subject: string;
    body: string;
    code: string;
}

export const emailService = {
    /**
     * Redirects the user to their mail client to "receive" the token or verification link.
     */
    async sendInstitutionalMail(to: string, code: string, isVerificationLink: boolean = false): Promise<void> {
        const subjectText = isVerificationLink 
            ? "StudentPocket: Institutional Email Verification Link" 
            : "StudentPocket: Identity Access Token";
            
        const bodyText = isVerificationLink
            ? `INSTITUTIONAL VERIFICATION PROTOCOL\n\n` +
              `You have requested email node verification for StudentPocket.\n\n` +
              `VERIFICATION LINK: ${window.location.origin}/?verify_email=${code}\n\n` +
              `OTP SECURE SEQUENCE: ${code}\n\n` +
              `This link and sequence will authorize your communication node.\n\n` +
              `--- End of Dispatch ---`
            : `INSTITUTIONAL ACCESS PROTOCOL\n\n` +
              `To authorize your current StudentPocket session, please use the following identification token:\n\n` +
              `ACCESS TOKEN: ${code}\n\n` +
              `DO NOT SHARE THIS CODE. This is a one-time institutional sequence.\n\n` +
              `--- End of Dispatch ---`;

        const subject = encodeURIComponent(subjectText);
        const body = encodeURIComponent(bodyText);

        const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}`;
        
        // Open the mail client (Gmail/Outlook/Apple Mail)
        window.location.href = mailtoLink;
    }
};
