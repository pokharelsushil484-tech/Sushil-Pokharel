
/**
 * StudentPocket - Institutional Dispatch System
 * Architect: Sushil Pokhrel
 */

export const emailService = {
    /**
     * Dispatches verification, auth tokens, or success notifications to the user node.
     */
    async sendInstitutionalMail(to: string, code: string, type: 'AUTH' | 'VERIFY' | 'SUCCESS' = 'AUTH'): Promise<void> {
        let subjectText = "";
        let bodyText = "";

        if (type === 'VERIFY') {
            subjectText = "StudentPocket: Action Required - Verify Your Communication Node";
            bodyText = `INSTITUTIONAL VERIFICATION PROTOCOL\n\n` +
                `To complete the verification of your student email node, please use the link or token below:\n\n` +
                `VERIFICATION LINK: ${window.location.origin}/?verify_node=${code}\n\n` +
                `TARGET NODE: ${to}\n\n` +
                `VERIFICATION TOKEN: ${code}\n\n` +
                `Authorizing this node ensures access to the Titanium Privacy features.\n\n` +
                `--- End of Dispatch ---`;
        } else if (type === 'SUCCESS') {
            subjectText = "StudentPocket: Institutional Node Verified Successfully";
            bodyText = `INSTITUTIONAL CLEARANCE GRANTED\n\n` +
                `Congratulations. Your identity node has been authorized by the Master Architect.\n\n` +
                `VERIFIED EMAIL: ${to}\n\n` +
                `STATUS: ACTIVE\n` +
                `CLEARANCE LEVEL: TITANIUM\n\n` +
                `You may now access all restricted data mesh features.\n\n` +
                `--- End of Dispatch ---`;
        } else {
            subjectText = "StudentPocket: Identity Access Token";
            bodyText = `INSTITUTIONAL ACCESS PROTOCOL\n\n` +
                `To authorize your current StudentPocket session, please use the following identification token:\n\n` +
                `ACCESS TOKEN: ${code}\n\n` +
                `DO NOT SHARE THIS CODE. This is a one-time institutional sequence.\n\n` +
                `--- End of Dispatch ---`;
        }

        const subject = encodeURIComponent(subjectText);
        const body = encodeURIComponent(bodyText);
        const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}`;
        
        window.location.href = mailtoLink;
    }
};
