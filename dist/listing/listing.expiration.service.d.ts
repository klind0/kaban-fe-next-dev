import { Model } from 'mongoose';
import { ListingDocument } from './schemas/listing.schema';
import { EmailService } from "../email/email.service";
import { ListingExpirationUtil } from "../utils/listingExpiration.util";
export declare class ListingExpirationService {
    private readonly listingModel;
    private readonly emailService;
    private readonly listingExpirationUtil;
    private readonly logger;
    constructor(listingModel: Model<ListingDocument>, emailService: EmailService, listingExpirationUtil: ListingExpirationUtil);
    processExpiredListings(): Promise<void>;
}
