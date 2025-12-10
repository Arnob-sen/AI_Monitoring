import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Company } from '../../companies/schemas/company.schema';

export type IntegrationDocument = HydratedDocument<Integration>;

// Define the type for credentials (nested object)
class Credentials {
  @Prop({ required: true })
  accessToken: string; // This will be ENCRYPTED

  @Prop()
  subdomain: string; // e.g. "mycompany" (for mycompany.zendesk.com)
}

@Schema({ timestamps: true })
export class Integration {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: Company;

  @Prop({ required: true, enum: ['zendesk', 'slack'] })
  provider: string;

  @Prop({ type: Credentials, required: true })
  credentials: Credentials;

  @Prop({ default: 'active' })
  status: string; // 'active', 'error', 'expired'

  @Prop()
  lastSyncedAt: Date;
}

export const IntegrationSchema = SchemaFactory.createForClass(Integration);
