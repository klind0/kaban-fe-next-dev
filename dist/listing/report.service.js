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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const report_schema_1 = require("./schemas/report.schema");
const email_service_1 = require("../email/email.service");
const listing_schema_1 = require("./schemas/listing.schema");
let ReportService = class ReportService {
    _reportModel;
    emailService;
    _listingModel;
    constructor(_reportModel, emailService, _listingModel) {
        this._reportModel = _reportModel;
        this.emailService = emailService;
        this._listingModel = _listingModel;
    }
    async create(createReportDto) {
        const listingId = new mongoose_2.Types.ObjectId(createReportDto.listing);
        const newReport = new this._reportModel({
            fullName: createReportDto.fullName,
            phone: createReportDto.phone,
            email: createReportDto.email,
            reason: createReportDto.reason,
            message: createReportDto.message,
            listing: listingId,
            createdAt: new Date(),
        });
        return await newReport.save();
    }
    async findMany(filter) {
        const query = {};
        if (filter?.listing) {
            if (!mongoose_2.Types.ObjectId.isValid(filter.listing)) {
                throw new common_1.BadRequestException('Invalid listing ID format');
            }
            query.listing = new mongoose_2.Types.ObjectId(filter.listing);
        }
        const reports = await this._reportModel
            .find(query)
            .populate({
            path: 'user',
            select: 'full_name email',
        })
            .populate({
            path: 'listing',
            select: 'title address price',
        })
            .select({ __v: 0, updatedAt: 0 })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return reports;
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid report ID format');
        }
        const report = await this._reportModel
            .findById(id)
            .populate({
            path: 'user',
            select: 'full_name email',
        })
            .populate({
            path: 'listing',
            select: 'title address price',
        })
            .select({ __v: 0, updatedAt: 0 })
            .exec();
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        return report;
    }
    async update(id, fields) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid report ID format');
        }
        const updated = await this._reportModel
            .findByIdAndUpdate(id, fields, { new: true })
            .select({ __v: 0, updatedAt: 0 })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException('Report not found');
        }
        return updated;
    }
    async delete(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid report ID format');
        }
        const deleted = await this._reportModel.findByIdAndDelete(id).exec();
        if (!deleted) {
            throw new common_1.NotFoundException('Report not found');
        }
        return deleted.id;
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(report_schema_1.Report.name)),
    __param(2, (0, mongoose_1.InjectModel)(listing_schema_1.Listing.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        email_service_1.EmailService,
        mongoose_2.Model])
], ReportService);
//# sourceMappingURL=report.service.js.map