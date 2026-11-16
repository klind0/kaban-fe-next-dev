import { ConfigService } from '@nestjs/config';
declare let config: ConfigService<unknown, boolean>;
export { config };
