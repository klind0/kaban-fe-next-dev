"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const resend_1 = require("resend");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
let EmailService = EmailService_1 = class EmailService {
    resend;
    logger = new common_1.Logger(EmailService_1.name);
    fromEmail;
    replyTo;
    frontendUrl = (process.env.FRONTEND_URL || 'https://www.kaban.ng').replace(/\/$/, '');
    url(path) {
        const p = path.startsWith('/') ? path : `/${path}`;
        return `${this.frontendUrl}${p}`;
    }
    templateCache = new Map();
    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not set in environment variables');
        }
        this.resend = new resend_1.Resend(apiKey);
        const fromName = (process.env.EMAIL_FROM_NAME || 'Kaban').trim();
        const fromAddress = (process.env.EMAIL_FROM_ADDRESS || '').trim();
        if (!fromName || !fromAddress) {
            throw new Error('EMAIL_FROM_NAME and EMAIL_FROM_ADDRESS must be set in .env (verified domain required)');
        }
        if (!fromAddress.includes('@')) {
            throw new Error('EMAIL_FROM_ADDRESS must be a valid email (e.g. admin@kaban.ng)');
        }
        this.fromEmail = `${fromName} <${fromAddress}>`.replace(/\s+/g, ' ').trim();
        this.replyTo = process.env.EMAIL_REPLY_TO?.trim() || fromAddress;
        this.logger.log(`Email sender configured as: ${this.fromEmail}`);
    }
    async renderTemplate(templateName, context) {
        try {
            let template = this.templateCache.get(templateName);
            if (!template) {
                const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
                if (!fs.existsSync(templatePath)) {
                    throw new Error(`Template not found: ${templatePath}`);
                }
                const source = fs.readFileSync(templatePath, 'utf8');
                template = handlebars.compile(source);
                this.templateCache.set(templateName, template);
            }
            return template(context);
        }
        catch (error) {
            this.logger.error(`Failed to render template ${templateName}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async sendEmail(to, subject, templateName, context) {
        this.logger.log(`Attempting to send from: ${this.fromEmail}`);
        try {
            const html = await this.renderTemplate(templateName, context);
            const { data, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject,
                html,
                replyTo: this.replyTo,
            });
            if (error) {
                this.logger.error(`Resend API error sending "${subject}" to ${Array.isArray(to) ? to.join(', ') : to}: ${error.message}`, error);
                return;
            }
            this.logger.log(`Email "${subject}" sent successfully to ${Array.isArray(to) ? to.join(', ') : to} - ID: ${data?.id}`);
        }
        catch (err) {
            this.logger.error(`Failed to send "${subject}" to ${Array.isArray(to) ? to.join(', ') : to}: ${err.message}`, err.stack);
        }
    }
    async sendWelcomeEmail(to, fullName) {
        await this.sendEmail(to, 'Welcome to Kaban – Start Listing Properties Today!', 'welcome', {
            name: fullName,
            loginUrl: this.url('/'),
            dashboardUrl: this.url('/dashboard'),
        });
    }
    async sendPasswordResetEmail(to, resetToken) {
        const frontendUrl = (process.env.FRONTEND_URL || 'https://www.kaban.ng').replace(/\/$/, '');
        const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
        await this.sendEmail(to, 'Kaban Password Reset Request', 'password-reset', {
            resetUrl,
            validity: '1 hour',
        });
    }
    async sendPasswordChangedEmail(to) {
        await this.sendEmail(to, 'Your Kaban Password Has Been Changed', 'password-changed', {
            loginUrl: this.url('/'),
        });
    }
    async sendListingApprovedEmail(to, listingTitle, listingId, publicSlug) {
        const viewUrl = publicSlug
            ? this.url(`/property/${publicSlug}`)
            : this.url('/dashboard');
        await this.sendEmail(to, `Your Listing "${listingTitle}" is Now Live!`, 'listing-approved', {
            listingTitle,
            viewUrl,
        });
    }
    async sendListingRejectedEmail(to, listingTitle, reason, listingId) {
        const editUrl = listingId
            ? this.url(`/dashboard/edit-listing/${listingId}`)
            : this.url('/dashboard');
        await this.sendEmail(to, `Your Listing "${listingTitle}" Needs Attention`, 'listing-rejected', {
            listingTitle,
            reason,
            editUrl,
        });
    }
    async sendNewReportEmail(to, listingTitle, reason, reporterName) {
        await this.sendEmail(to, `New Report on Your Listing: ${listingTitle}`, 'new-report', {
            listingTitle,
            reason,
            reporterName: reporterName || 'Anonymous',
            dashboardUrl: this.url('/dashboard'),
        });
    }
    async sendNewReportAdminEmail(adminEmail, listingTitle, reason) {
        await this.sendEmail(adminEmail, `[ADMIN] New Report on Listing: ${listingTitle}`, 'new-report-admin', {
            listingTitle,
            reason,
            reviewUrl: this.url('/admin/listings/pending'),
        });
    }
    async sendListingExpiredEmail(to, listingTitle, listingId) {
        const renewUrl = this.url('/dashboard');
        await this.sendEmail(to, `Your Listing "${listingTitle}" Has Expired`, 'listing-expired', {
            listingTitle,
            renewUrl,
        });
    }
    async sendNewRealtorAdminNotification(adminEmail, realtorName, realtorEmail) {
        await this.sendEmail(adminEmail, `[ADMIN] New Realtor Registered: ${realtorName}`, 'new-realtor-admin', {
            realtorName,
            realtorEmail,
            reviewUrl: this.url('/admin/listings/pending'),
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map