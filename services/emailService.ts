
/**
 * StudentPocket Email Dispatch System
 * Simulates institutional mail server activity
 */

export interface EmailPayload {
    to: string;
    subject: string;
    body: string;
    code: string;
    timestamp: number;
}

export const emailService = {
    /**
     * Simulates sending an email by dispatching a custom event 
     * that the App UI can listen for to show a notification.
     */
    async sendInstitutionalMail(to: string, code: string): Promise<boolean> {
        console.log(`[MAIL SERVER] Dispatching code ${code} to node ${to}`);
        
        const payload: EmailPayload = {
            to,
            subject: "Identity Verification Protocol",
            body: `Your StudentPocket zig-zag access code is: ${code}`,
            code,
            timestamp: Date.now()
        };

        // Dispatch a global event so the UI can "receive" the email
        const event = new CustomEvent('STUDENTPOCKET_MAIL_RECEIVED', { detail: payload });
        window.dispatchEvent(event);

        return true;
    }
};
