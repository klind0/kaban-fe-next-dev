export declare class EmailService {
    private readonly resend;
    private readonly logger;
    private readonly fromEmail;
    private readonly replyTo;
    private readonly frontendUrl;
    private url;
    private templateCache;
    constructor();
    private renderTemplate;
    private sendEmail;
    sendWelcomeEmail(to: string, fullName: string): Promise<void>;
    sendPasswordResetEmail(to: string, resetToken: string): Promise<void>;
    sendPasswordChangedEmail(to: string): Promise<void>;
    sendListingApprovedEmail(to: string, listingTitle: string, listingId: string, publicSlug?: string): Promise<void>;
    sendListingRejectedEmail(to: string, listingTitle: string, reason: string, listingId?: string): Promise<void>;
    sendNewReportEmail(to: string, listingTitle: string, reason: string, reporterName?: string): Promise<void>;
    sendNewReportAdminEmail(adminEmail: string, listingTitle: string, reason: string): Promise<void>;
    sendListingExpiredEmail(to: string, listingTitle: string, listingId: string): Promise<void>;
    sendNewRealtorAdminNotification(adminEmail: string, realtorName: string, realtorEmail: string): Promise<void>;
}
