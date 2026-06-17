import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Partner } from '../../partners/entities/partner.entity';

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
}

export enum CampaignType {
  SEASONAL = 'seasonal',
  FLASH_SALE = 'flash_sale',
  LOYALTY = 'loyalty',
  PARTNERSHIP = 'partnership',
  EVENT = 'event',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'campaign_type',
    type: 'enum',
    enum: CampaignType,
    default: CampaignType.SEASONAL,
  })
  campaignType: CampaignType;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @Column({ name: 'partner_id', type: 'uuid', nullable: true })
  partnerId: string;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  @Column({ name: 'bonus_points', type: 'integer', default: 0 })
  bonusPoints: number;

  @Column({ name: 'bonus_discount', type: 'decimal', precision: 5, scale: 2, default: 0 })
  bonusDiscount: number;

  @Column({ name: 'max_participants', type: 'integer', nullable: true })
  maxParticipants: number;

  @Column({ name: 'current_participants', type: 'integer', default: 0 })
  currentParticipants: number;

  @Column({ name: 'banner_url', type: 'text', nullable: true })
  bannerUrl: string;

  @Column({ name: 'terms_conditions', type: 'text', nullable: true })
  termsConditions: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Partner, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;
}
