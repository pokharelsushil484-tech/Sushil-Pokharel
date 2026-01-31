
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
     * Redirects the user to their mail client to "receive" the token.
     * This ensures the token is not displayed directly in the app.
     */
    async sendInstitutionalMail(to: string, code: string): Promise<void> {
        const subject = encodeURIComponent("StudentPocket: Identity Access Token");
        const body = encodeURIComponent(
            `INSTITUTIONAL ACCESS PROTOCOL\n\n` +
            `To authorize your current StudentPocket session, please use the following identification token:\n\n` +
            `ACCESS TOKEN: ${code}\n\n` +
            `DO NOT SHARE THIS CODE. This is a one-time institutional sequence.\n\n` +
            `--- End of Dispatch ---`
        );

        const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}`;
        
        // Open the mail client (Gmail/Outlook/Apple Mail)
        window.location.href = mailtoLink;
    }
};
