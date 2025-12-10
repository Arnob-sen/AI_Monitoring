import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ timestamps: true }) // Automatically adds createdAt and updatedAt
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  domain: string; // e.g., "acme.com" - used to identify users

  @Prop({ default: 'free' })
  plan: string; // 'free', 'pro', 'enterprise'

  @Prop({ default: true })
  isActive: boolean;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
